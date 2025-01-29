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
    // 🔹 Proceso de autenticación de tenant
    const tenant = await this.tenantsService.findByBusinessNameAndEmail(businessName, email);
    if (tenant) {
      if (!tenant.isActive) {
        throw new UnauthorizedException('El negocio está inactivo. Contacte al administrador.');
      }

      const isPasswordValid = verifyPassword(password, tenant.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // 🔹 Generamos accessToken y refreshToken
      const accessToken = this.generateAccessToken(tenant);
      const refreshToken = this.generateRefreshToken(tenant);

      // 🔹 Guardamos la sesión activa en la base de datos
      await this.manageActiveSessions(tenant, refreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        role: 'ADMIN',
        businessName: tenant.businessName,
        email: tenant.email,
      };
    }

    // 🔹 Proceso de autenticación de usuario
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
          tenantId: entity._id.toString(), // Para tenant, el ID es su propio _id
          businessName: (entity as Tenant).businessName,
          email: entity.email,
          role: 'ADMIN',
        }
      : {
          tenantId: (entity as User).tenantId.toString(), // Para user, usamos su tenantId
          username: (entity as User).name,
          email: entity.email,
          role: (entity as User).role,
        };

    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(entity: User | Tenant) {
    const payload = {
      sub: entity._id.toString(),
      tenantId:
        'businessName' in entity ? entity._id.toString() : (entity as User).tenantId.toString(),
      type: 'businessName' in entity ? 'tenant' : 'user',
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async manageActiveSessions(entity: User | Tenant, newRefreshToken: string) {
    try {
      // Asegurarnos que activeSession existe
      if (!entity.activeSession) {
        entity.activeSession = [];
      }

      const MAX_SESSIONS = entity.maxActiveSessions || 3;
      Logger.debug(`Sesiones activas antes: ${JSON.stringify(entity.activeSession)}`);
      // Eliminar sesiones antiguas si se excede el límite
      if (entity.activeSession.length >= MAX_SESSIONS) {
        entity.activeSession.shift();
      }

      const newSession = {
        token: newRefreshToken,
        createdAt: new Date(),
        lastUsed: new Date(),
        deviceInfo: this.getDeviceInfo(), // Ahora devuelve un string
      };

      entity.activeSession.push(newSession);
      Logger.debug(`Sesiones activas después: ${JSON.stringify(entity.activeSession)}`);
      // Actualizar la entidad según su tipo
      if ('businessName' in entity) {
        // Es un Tenant
        await this.tenantsService.updateTenant(entity._id.toString(), {
          activeSession: entity.activeSession,
        });
      } else {
        // Es un Usuario
        await this.usersService.updateUser(entity._id.toString(), {
          activeSession: entity.activeSession,
        });
      }

      this.logger.debug(
        `Sesión activa guardada para ${
          'businessName' in entity ? 'tenant' : 'usuario'
        } ${entity._id}`,
      );
      Logger.debug(
        `Sesión guardada correctamente para ${'businessName' in entity ? 'Tenant' : 'User'}`,
      );
    } catch (error) {
      this.logger.error('Error al gestionar las sesiones activas:', error);
      throw new UnauthorizedException('Error al gestionar la sesión');
    }
  }

  private getDeviceInfo(): string {
    // Convertimos la información del dispositivo a string
    const deviceInfo = {
      userAgent: 'Device Info Placeholder',
      platform: 'web',
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(deviceInfo);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const isTenant = decoded.type === 'tenant';

      const entity = isTenant
        ? await this.tenantsService.findById(decoded.sub)
        : await this.usersService.findById(decoded.sub);

      if (!entity || !entity.isActive) {
        throw new UnauthorizedException('Entidad inválida o inactiva');
      }

      // Verificar si el token está en las sesiones activas
      const validSession = entity.activeSession?.some((session) => session.token === refreshToken);
      if (!validSession) {
        throw new UnauthorizedException('Sesión inválida');
      }

      // Actualizar lastUsed de la sesión
      if (entity.activeSession) {
        const sessionIndex = entity.activeSession.findIndex(
          (session) => session.token === refreshToken,
        );
        if (sessionIndex !== -1) {
          entity.activeSession[sessionIndex].lastUsed = new Date();

          if (isTenant) {
            await this.tenantsService.updateTenant(entity._id.toString(), {
              activeSession: entity.activeSession,
            });
          } else {
            await this.usersService.updateUser(entity._id.toString(), {
              activeSession: entity.activeSession,
            });
          }
        }
      }

      return {
        access_token: this.generateAccessToken(entity),
      };
    } catch (error) {
      this.logger.error('Error al refrescar el token:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const isTenant = decoded.type === 'tenant';

      const entity = isTenant
        ? await this.tenantsService.findById(decoded.sub)
        : await this.usersService.findById(decoded.sub);

      if (entity && entity.activeSession) {
        entity.activeSession = entity.activeSession.filter(
          (session) => session.token !== refreshToken,
        );

        if (isTenant) {
          await this.tenantsService.updateTenant(entity._id.toString(), {
            activeSession: entity.activeSession,
          });
        } else {
          await this.usersService.updateUser(entity._id.toString(), {
            activeSession: entity.activeSession,
          });
        }

        return { message: 'Sesión cerrada exitosamente' };
      }
    } catch (error) {
      this.logger.error('Error al cerrar sesión:', error);
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }
}
