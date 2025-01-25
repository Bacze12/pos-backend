import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../modules/tenants/tenants.service';
import { UsersService } from '../modules/users/users.service';
import { verifyPassword } from '../middleware/crypto.middleware';
import { User } from '../modules/users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async login(businessName: string, email: string, password: string) {
    // Proceso de autenticación de tenant (sin cambios)
    const tenant = await this.tenantsService.findByBusinessNameAndEmail(businessName, email);
    if (tenant) {
      if (!tenant.isActive) {
        throw new UnauthorizedException('El negocio está inactivo. Contacte al administrador.');
      }

      const isPasswordValid = verifyPassword(password, tenant.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const payload = {
        tenantId: tenant._id,
        businessName: tenant.businessName,
        email: tenant.email,
        role: 'ADMIN',
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    // Proceso de autenticación de usuario
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

    // Generar tokens con gestión de sesiones
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Gestionar sesiones activas
    await this.manageActiveSessions(user, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(user: User) {
    const payload = {
      tenantId: user.tenantId,
      username: user.name,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: User) {
    const payload = {
      sub: user._id,
      tenantId: user.tenantId,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private async manageActiveSessions(user: User, newRefreshToken: string) {
    // Límite de sesiones (por defecto 3)
    const MAX_SESSIONS = user.maxActiveSessions || 3;

    // Si se alcanza el límite, eliminar la sesión más antigua
    if (user.activeSession.length >= MAX_SESSIONS) {
      user.activeSession.shift();
    }

    // Agregar nueva sesión
    user.activeSession.push({
      token: newRefreshToken,
      createdAt: new Date(),
      lastUsed: new Date(),
      deviceInfo: this.getDeviceInfo(), // Implementa método para obtener info del dispositivo
    });

    await this.usersService.updateUser(user.id, {
      activeSession: user.activeSession,
    });
  }

  private getDeviceInfo() {
    // Implementa lógica para obtener información del dispositivo
    // Puedes usar headers, user-agent, etc.
    return 'Device Info Placeholder';
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verificar y decodificar el refresh token
      const decoded = this.jwtService.verify(refreshToken);

      // Buscar usuario
      const user = await this.usersService.findById(decoded.sub);

      // Verificar si el usuario está activo
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      // Verificar si el refresh token existe en sesiones activas
      const validSession = user.activeSession.some((session) => session.token === refreshToken);

      if (!validSession) {
        throw new UnauthorizedException('Sesión inválida');
      }

      // Generar nuevo access token
      return {
        access_token: this.generateAccessToken(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(refreshToken: string) {
    try {
      // Decodificar token
      const decoded = this.jwtService.verify(refreshToken);

      // Buscar usuario
      const user = await this.usersService.findById(decoded.sub);

      if (user) {
        // Eliminar este refresh token de las sesiones activas
        user.activeSession = user.activeSession.filter((session) => session.token !== refreshToken);

        await this.usersService.updateUser(user.id, {
          activeSession: user.activeSession,
        });
      }
    } catch (error) {
      // Manejar errores de token
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }
}
