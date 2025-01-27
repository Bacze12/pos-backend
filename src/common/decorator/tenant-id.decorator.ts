// src/common/decorators/tenant-id.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const TenantId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const tenantId = request.user?.tenantId;
  if (!tenantId) throw new UnauthorizedException('Tenant ID no encontrado en el token JWT');
  return tenantId;
});
