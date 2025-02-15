import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';

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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Cierre de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(@Request() req) {
    const userId = req.user.tenantId || req.user.userId;
    const isTenant = req.user.role === 'ADMIN';
    await this.authService.logout(userId, isTenant);
    return { message: 'Cierre de sesión exitoso' };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description: 'Permite a los usuarios obtener un nuevo token de acceso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token de acceso actualizado',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token no proporcionado');
    }
    try {
      return await this.authService.refreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
