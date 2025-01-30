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

  /**
   * Authenticates a tenant based on business name, email, and password.
   * @param businessName - The business name associated with the tenant.
   * @param email - The email of the tenant.
   * @param password - The password of the tenant.
   * @returns An object containing the access token if authentication is successful.
   */
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
    return null;
  }

  /**
   * Authenticates a user based on business name, email, and password.
   * @param businessName - The business name associated with the user.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns An object containing the access token and refresh token if authentication is successful.
   */
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
    };
  }

  /**
   * Generates an access token for a user.
   * @param user - The user for whom the access token is generated.
   * @returns The generated access token.
   */
  private generateAccessToken(user: User) {
    const payload = {
      tenantId: user.tenantId,
      username: user.name,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  /**
   * Generates a refresh token for a user.
   * @param user - The user for whom the refresh token is generated.
   * @returns The generated refresh token.
   */
  private generateRefreshToken(user: User) {
    const payload = {
      sub: user._id,
      tenantId: user.tenantId,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  /**
   * Manages the active sessions for a user, ensuring the session limit is not exceeded.
   * @param user - The user whose sessions are being managed.
   * @param newRefreshToken - The new refresh token to be added to the active sessions.
   */
  private async manageActiveSessions(user: User, newRefreshToken: string) {
    const MAX_SESSIONS = user.maxActiveSessions || 3;

    if (user.activeSession.length >= MAX_SESSIONS) {
      user.activeSession.shift();
    }

    user.activeSession.push({
      token: newRefreshToken,
      createdAt: new Date(),
      lastUsed: new Date(),
      deviceInfo: this.getDeviceInfo(),
    });

    await this.usersService.updateUser(user.id, {
      activeSession: user.activeSession,
    });
  }

  /**
   * Retrieves device information for session management.
   * @returns A placeholder string for device information.
   */
  private getDeviceInfo() {
    return 'Device Info Placeholder';
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param refreshToken - The refresh token used to generate a new access token.
   * @returns An object containing the new access token.
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.usersService.findById(decoded.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      const validSession = user.activeSession.some((session) => session.token === refreshToken);

      if (!validSession) {
        throw new UnauthorizedException('Sesión inválida');
      }

      return {
        access_token: this.generateAccessToken(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Logs out a user by removing the refresh token from active sessions.
   * @param refreshToken - The refresh token to be removed from active sessions.
   */
  async logout(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.usersService.findById(decoded.sub);

      if (user) {
        user.activeSession = user.activeSession.filter((session) => session.token !== refreshToken);

        await this.usersService.updateUser(user.id, {
          activeSession: user.activeSession,
        });
      }
    } catch (error) {
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }
}
