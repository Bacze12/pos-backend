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
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('categories') // Agrupa los endpoints bajo "categories"
@ApiBearerAuth() // Indica que requieren autenticación JWT
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
  @ApiOperation({
    summary: 'Obtener todas las categorías',
    description: 'Devuelve una lista de todas las categorías asociadas al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Categorías recuperadas con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Falta el token JWT o es inválido.' })
  async findAll(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.categoryService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva categoría',
    description: 'Crea una nueva categoría asociada al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Categoría creada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() request: any,
  ) {
    const tenantId = request.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('TenantId es requerido');
    }

    const categoryWithTenantId = { ...createCategoryDto, tenantId };
    return this.categoryService.create(categoryWithTenantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una categoría',
    description: 'Actualiza los datos de una categoría existente para el tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Categoría actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.categoryService.update(id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una categoría',
    description: 'Elimina una categoría asociada al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Categoría eliminada con éxito.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async remove(@Req() req, @Param('id') id: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.categoryService.remove(id, tenantId);
  }
}
