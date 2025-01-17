/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get()
  async findAll(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.categoryService.findAll(tenantId);
  }

  @Post()
  async create(
    @Body() createCategoryDto: any,
    @Req() request: any, // `request` contiene la información del usuario autenticado
  ) {
    const tenantId = request.user.tenantId; // Extrae tenantId del token JWT
    if (!tenantId) {
      throw new BadRequestException('TenantId es requerido');
    }

    // Agrega tenantId al DTO
    const categoryWithTenantId = { ...createCategoryDto, tenantId };
    return this.categoryService.create(categoryWithTenantId);
  }

  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateCategoryDto: any) {
    const tenantId = this.getTenantIdFromRequest(req);
    const updateCategorie = await this.categoryService.update(id, updateCategoryDto, tenantId);
    return updateCategorie;
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const tenantId = this.getTenantIdFromRequest(req);

    const removeCategorie = await this.categoryService.remove(id, tenantId);
    return removeCategorie;
  }
}
