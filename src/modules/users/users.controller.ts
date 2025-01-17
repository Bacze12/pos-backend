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

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Aplica RolesGuard y AuthGuard a nivel del controlador
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
  @Roles('ADMIN', 'MANAGER') // Ejemplo: Solo ADMIN y MANAGER pueden acceder
  async getUsers(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'CASHIER') // Cualquier rol puede acceder
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
  async createUser(@Req() req, @Body() userData: any) {
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
  @Roles('ADMIN', 'MANAGER') // Ejemplo: ADMIN y MANAGER pueden actualizar
  async updateUser(@Req() req, @Param('id') id: string, @Body() updateData: any) {
    const tenantId = this.getTenantIdFromRequest(req);
    const updatedUser = await this.usersService.update(id, updateData, tenantId);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return updatedUser;
  }

  @Delete(':id')
  @Roles('ADMIN') // Solo ADMIN puede eliminar usuarios
  async deleteUser(@Req() req, @Param('id') id: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    const result = await this.usersService.delete(id, tenantId);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return result;
  }
}
