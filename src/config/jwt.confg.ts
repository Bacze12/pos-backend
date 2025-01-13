import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'defaultSecret',
  signOptions: { expiresIn: '24h' },
};
