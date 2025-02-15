import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users.schema';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../../auth/auth.module';
import { jwtConfig } from '../../config/jwt.confg';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    forwardRef(() => AuthModule), // Usa forwardRef aquí
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, MongooseModule],
})
export class UsersModule implements NestModule {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  configure(consumer: MiddlewareConsumer) {
    // Aplica el middleware TenantMiddleware solo a las rutas de UsersController
  }
}
