import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Si no hay roles definidos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // El usuario debe venir del token JWT

    if (!user || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('Acceso denegado. Rol insuficiente.');
    }

    return true; // Permitir acceso si el rol del usuario está en los roles requeridos
  }
}
