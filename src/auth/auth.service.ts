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

      const { accessToken, refreshToken } = await this.generateAuthTokens(tenant);

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

    const { accessToken, refreshToken } = await this.generateAuthTokens(user);

    await this.manageActiveSessions(user, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role,
      username: user.name,
      email: user.email,
    };
  }

  private async generateAuthTokens(entity: User | Tenant) {
    const accessToken = this.generateAccessToken(entity);
    const refreshToken = await this.generateRefreshToken(entity);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(entity: User | Tenant) {
    const payload =
      'businessName' in entity
        ? {
            tenantId: entity._id.toString(),
            businessName: (entity as Tenant).businessName,
            email: entity.email,
            role: 'ADMIN',
          }
        : {
            tenantId: (entity as User).tenantId,
            username: (entity as User).name,
            email: entity.email,
            role: (entity as User).role,
          };

    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  async generateRefreshToken(entity: User | Tenant) {
    const payload = {
      sub: entity._id.toString(),
      tenantId: 'businessName' in entity ? entity._id.toString() : (entity as User).tenantId,
      type: 'businessName' in entity ? 'tenant' : 'user',
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async manageActiveSessions(entity: User | Tenant, tokenString: string) {
    try {
      if (!entity.activeSession) {
        entity.activeSession = [];
      }

      const MAX_SESSIONS = entity.maxActiveSessions || 3;
      this.logger.debug(
        `Sesiones activas: ${entity.activeSession.length}, Máximo permitido: ${MAX_SESSIONS}`,
      );

      if (entity.activeSession.length >= MAX_SESSIONS) {
        entity.activeSession.shift();
      }

      const newRefreshToken = {
        token: tokenString,
        createdAt: new Date(),
        lastUsed: new Date(),
        deviceInfo: 'web',
      };

      entity.activeSession.push(newRefreshToken);

      if ('businessName' in entity) {
        await this.tenantsService.updateTenant(entity._id.toString(), {
          activeSession: entity.activeSession,
        });
      } else {
        await this.usersService.update(
          entity._id.toString(),
          { activeSession: entity.activeSession },
          (entity as User).tenantId,
        );
      }
    } catch (error) {
      this.logger.error('Error gestionando sesiones activas', error);
      throw new UnauthorizedException('Error gestionando la sesión activa');
    }
  }

  async logout(userId: string, isTenant: boolean) {
    this.logger.log(`Cerrando sesión para el usuario/tenant con ID: ${userId}`);
    if (isTenant) {
      await this.tenantsService.updateTenant(userId, { activeSession: [] });
    } else {
      const user = await this.usersService.findById(userId);
      if (user) {
        await this.usersService.update(userId, { activeSession: [] }, user.tenantId);
      } else {
        this.logger.warn(`Usuario con ID ${userId} no encontrado durante logout.`);
      }
    }
  }

  async refreshToken(refreshTokenString: string) {
    try {
      const payload = this.jwtService.verify(refreshTokenString);
      const entityId = payload.sub;
      const entityType = payload.type;
      const payloadTenantId = payload.tenantId;

      let entity: Tenant | User;

      if (entityType === 'tenant') {
        entity = await this.tenantsService.findById(entityId);
        if (!entity) {
          throw new UnauthorizedException('Tenant no encontrado con refresh token');
        }
      } else if (entityType === 'user') {
        entity = await this.usersService.findById(entityId, payloadTenantId);
        if (!entity) {
          throw new UnauthorizedException('Usuario no encontrado con refresh token');
        }
      } else {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      const isValidSession = entity.activeSession?.some(
        (session) => session.token === refreshTokenString,
      );
      if (!isValidSession) {
        throw new UnauthorizedException('Refresh token no válido o sesión terminada');
      }

      const { accessToken, refreshToken: newRefreshToken } = await this.generateAuthTokens(entity);

      const updatedActiveSessions = entity.activeSession.map((session) =>
        session.token === refreshTokenString
          ? { ...session, token: newRefreshToken, lastUsed: new Date() }
          : session,
      );

      if ('businessName' in entity) {
        await this.tenantsService.updateTenant(entity._id.toString(), {
          activeSession: updatedActiveSessions,
        });
      } else {
        await this.usersService.update(
          entity._id.toString(),
          { activeSession: updatedActiveSessions },
          (entity as User).tenantId,
        );
      }

      return { access_token: accessToken, refresh_token: newRefreshToken };
    } catch (error) {
      this.logger.error('Error al refrescar el token', error);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
