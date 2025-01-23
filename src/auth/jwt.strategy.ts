import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../config/jwt.confg';
import { UsersService } from '../modules/users/users.service'; // Importa tu servicio de usuarios

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  private readonly logger = new Logger(JwtStrategy.name);

  async validate(payload: any) {
    this.logger.log('Validando token:', payload);

    if (!payload || !payload.tenantId) {
      throw new UnauthorizedException('Token inválido - Falta tenantId');
    }

    // Busca al usuario en la base de datos para validar isActive
    const user = await this.usersService.findById(payload.sub, payload.tenantId); // `sub` suele ser el ID del usuario en el payload JWT

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está inactivo.');
    }

    this.logger.log('Usuario validado y activo:', {
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    return {
      id: user._id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role || 'USER', // Distingue entre USER y ADMIN
    };
  }
}
