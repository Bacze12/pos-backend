// src/common/decorators/tenant-id.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

export const TenantId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  Logger.debug('Request user:', request.user); // Añade este log para debug

  const tenantId = request.user?.tenantId;

  if (!tenantId) {
    throw new UnauthorizedException('Tenant ID no encontrado en el token JWT');
  }

  return tenantId.toString();
});
