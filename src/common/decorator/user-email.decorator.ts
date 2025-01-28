import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const UserEmail = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const email = request.user?.email;
  if (!email) throw new UnauthorizedException('Email no encontrado en el token JWT');
  return email;
});
