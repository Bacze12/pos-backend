import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body()
    loginData: {
      businessName: string;
      email: string;
      password: string;
    },
  ) {
    try {
      return await this.authService.login(
        loginData.businessName,
        loginData.email,
        loginData.password,
      );
    } catch (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
