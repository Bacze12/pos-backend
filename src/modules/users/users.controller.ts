import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Patch,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description: 'Devuelve todos los usuarios asociados al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuarios recuperados con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getUsers(@TenantId() tenantId: string) {
    this.logger.log(`Obteniendo usuarios para tenant: ${tenantId}`);
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description: 'Devuelve un usuario específico asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario recuperado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getUserById(@TenantId() tenantId: string, @Param('id') id: string) {
    const user = await this.usersService.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description: 'Crea un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createUser(@TenantId() tenantId: string, @Body() userData: CreateUserDto) {
    this.logger.log(`Creando usuario para tenant: ${tenantId}`);
    try {
      return await this.usersService.create({
        ...userData,
        tenantId,
      });
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description: 'Actualiza los datos de un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateUser(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, updateData, tenantId);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return updatedUser;
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Eliminar un usuario',
    description: 'Elimina un usuario asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async deleteUser(@TenantId() tenantId: string, @Param('id') id: string) {
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
  async updateUserStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.active(id, tenantId, isActive);
  }
}
