// src/common/decorators/tenant-id.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

export const TenantId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  Logger.debug('Request headers:', request.headers);
  Logger.debug('Request user:', JSON.stringify(request.user, null, 2));

  const tenantId = request.user?.tenantId;

  if (!tenantId) {
    Logger.error('No tenantId found in request.user');
    throw new UnauthorizedException('Tenant ID no encontrado en el token JWT');
  }

  return tenantId.toString();
});
