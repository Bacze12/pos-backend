import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('users') // Grupo de Swagger para este controlador
@ApiBearerAuth() // Indica que los endpoints requieren autenticación con JWT
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Aplica RolesGuard y AuthGuard
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get()
  @Roles('ADMIN', 'MANAGER') // Solo ADMIN y MANAGER pueden acceder
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description: 'Devuelve todos los usuarios asociados al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuarios recuperados con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Falta token JWT o es inválido.' })
  async getUsers(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'CASHIER') // ADMIN, MANAGER y CASHIER pueden acceder
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description: 'Devuelve un usuario específico asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario recuperado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getUserById(@Req() req, @Param('id') id: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    const user = await this.usersService.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  @Post()
  @Roles('ADMIN') // Solo ADMIN puede crear usuarios
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description: 'Crea un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createUser(@Req() req, @Body() userData: CreateUserDto) {
    const tenantId = this.getTenantIdFromRequest(req);

    if (!userData.name || !userData.email || !userData.password) {
      throw new BadRequestException('Datos inválidos para el usuario');
    }

    const userDataWithTenant = {
      ...userData,
      tenantId,
    };

    return this.usersService.create(userDataWithTenant);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER') // ADMIN y MANAGER pueden actualizar usuarios
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description: 'Actualiza los datos de un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateUser(@Req() req, @Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const tenantId = this.getTenantIdFromRequest(req);
    const updatedUser = await this.usersService.update(id, updateData, tenantId);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return updatedUser;
  }

  @Delete(':id')
  @Roles('ADMIN') // Solo ADMIN puede eliminar usuarios
  @ApiOperation({
    summary: 'Eliminar un usuario',
    description: 'Elimina un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async deleteUser(@Req() req, @Param('id') id: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    const result = await this.usersService.delete(id, tenantId);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return result;
  }

  @Patch(':id/active')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Activar/Desactivar usuario',
    description: 'Cambia el estado activo/inactivo de un usuario del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Estado de usuario actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'true para activar, false para desactivar',
        },
      },
    },
  })
  async updateUserStatus(@Req() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.usersService.active(id, tenantId, isActive);
  }
}
