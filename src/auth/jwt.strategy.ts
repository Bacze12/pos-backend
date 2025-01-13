import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/config/jwt.confg';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    console.log('Validando token:', payload);

    if (!payload || !payload.tenantId) {
      throw new UnauthorizedException('Token inválido - Falta tenantId');
    }

    const user = {
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role || 'USER', // Distingue entre USER y ADMIN
    };

    console.log('Usuario validado:', user);
    return user;
  }
}
