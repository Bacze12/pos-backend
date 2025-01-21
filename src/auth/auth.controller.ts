import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Agrupa los endpoints bajo "auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Permite a los usuarios autenticarse con su correo electrónico, contraseña y nombre del negocio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso. Devuelve un token de autenticación.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas. No se pudo autenticar al usuario.',
  })
  async login(
    @Body()
    loginData: LoginDto,
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
