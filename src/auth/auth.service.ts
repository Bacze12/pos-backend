import { Injectable, UnauthorizedException, Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../modules/tenants/tenants.service';
import { UsersService } from '../modules/users/users.service';
import { verifyPassword } from '../middleware/crypto.middleware';
import { User } from '../modules/users/users.schema';
import { Tenant } from '@/modules/tenants/tenants.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  /**
   * Handles the login process for both tenants and users.
   * @param businessName - The business name associated with the tenant or user.
   * @param email - The email of the tenant or user.
   * @param password - The password of the tenant or user.
   * @returns An object containing the access token and refresh token.
   */
  async login(businessName: string, email: string, password: string) {
    const tenant = await this.authenticateTenant(businessName, email, password);
    if (tenant) {
      return tenant;
    }

    const user = await this.authenticateUser(businessName, email, password);
    if (user) {
      return user;
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }

  private async authenticateTenant(businessName: string, email: string, password: string) {
    const tenant = await this.tenantsService.findByBusinessNameAndEmail(businessName, email);
    if (tenant) {
      if (!tenant.isActive) {
        throw new UnauthorizedException('El negocio está inactivo. Contacte al administrador.');
      }

      const isPasswordValid = verifyPassword(password, tenant.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const accessToken = this.generateAccessToken(tenant);
      const refreshToken = this.generateRefreshToken(tenant);

      await this.manageActiveSessions(tenant, refreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        role: 'ADMIN',
        businessName: tenant.businessName,
        email: tenant.email,
      };
    }
    return null;
  }

  private async authenticateUser(businessName: string, email: string, password: string) {
    const tenantFromBusiness = await this.tenantsService.findByBusinessName(businessName);
    if (!tenantFromBusiness) {
      throw new UnauthorizedException('El negocio no existe');
    }

    const user = await this.usersService.findByEmailAndTenant(
      email,
      tenantFromBusiness._id.toString(),
    );
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está inactivo. Contacte al administrador.');
    }

    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.manageActiveSessions(user, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role,
      username: user.name,
      email: user.email,
    };
  }

  private generateAccessToken(entity: User | Tenant) {
    const isTenant = 'businessName' in entity;

    const payload = isTenant
      ? {
          tenantId: entity._id.toString(),
          businessName: (entity as Tenant).businessName,
          email: entity.email,
          role: 'ADMIN',
        }
      : {
          tenantId: (entity as User).tenantId.toString(),
          username: (entity as User).name,
          email: entity.email,
          role: (entity as User).role,
        };

    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(entity: User | Tenant) {
    const payload = {
      sub: entity._id.toString(),
      tenantId: 'businessName' in entity ? entity._id.toString() : (entity as User).tenantId.toString(),
      type: 'businessName' in entity ? 'tenant' : 'user',
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async manageActiveSessions(entity: User | Tenant, newRefreshToken: string) {
    try {
      if (!entity.activeSession) {
        entity.activeSession = [];
      }

      const MAX_SESSIONS = entity.maxActiveSessions || 3;
      this.logger.debug(`Sesiones activas: ${entity.activeSession.length}, Máximo permitido: ${MAX_SESSIONS}`);

      if (entity.activeSession.length >= MAX_SESSIONS) {
        entity.activeSession.shift(); // Elimina la sesión más antigua
      }

      entity.activeSession.push(newRefreshToken);
      // Aquí se debería guardar el cambio en la base de datos, por ejemplo:
      // await this.tenantsService.update(entity._id, { activeSession: entity.activeSession });
    } catch (error) {
      this.logger.error('Error gestionando sesiones activas', error);
      throw new UnauthorizedException('Error gestionando la sesión activa');
    }
  }
}
