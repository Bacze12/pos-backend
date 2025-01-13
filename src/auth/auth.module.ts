import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenantsModule } from 'src/modules/tenants/tenants.module';
import { UsersModule } from 'src/modules/users/user.module';
import { JwtStrategy } from './jwt.strategy';
import { jwtConfig } from 'src/config/jwt.confg';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TenantsModule,
    forwardRef(() => UsersModule), // Usa forwardRef aquí
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
