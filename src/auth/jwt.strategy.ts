import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../config/jwt.confg';
import { UsersService } from '../modules/users/users.service';
import { TenantsService } from '../modules/tenants/tenants.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }
  private readonly logger = new Logger(JwtStrategy.name);

  async validate(payload: any) {
    Logger.debug('JWT Payload:', payload);

    const tenantId = payload.tenantId;
    const isTenant = payload.businessName && !payload.username;

    if (!tenantId) {
      throw new UnauthorizedException('Token inválido - Falta tenantId');
    }

    if (isTenant) {
      const tenant = await this.tenantsService.findById(tenantId);
      if (!tenant) {
        throw new UnauthorizedException('Tenant no encontrado');
      }

      return {
        tenantId: tenant._id.toString(), // Aseguramos que tenantId es string
        email: payload.email,
        businessName: payload.businessName,
        role: 'ADMIN',
      };
    }

    // Si es un usuario
    const user = await this.usersService.findByEmailAndTenant(payload.email, tenantId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      tenantId: tenantId.toString(),
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
