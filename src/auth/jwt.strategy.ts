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
    if (!payload || !payload.tenantId) {
      throw new UnauthorizedException('Token inválido - Falta tenantId');
    }

    const user = await this.usersService.findById(payload.sub, payload.tenantId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const tenant = await this.tenantsService.findById(payload.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Tenant inactivo');
    }

    return {
      tenantId: payload.tenantId,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'USER',
    };
  }
}
