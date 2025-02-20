import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las categorías',
    description: 'Devuelve categorías del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Categorías recuperadas con éxito.' })
  async findAll(@TenantId() tenantId: string) {
    return this.categoryService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear nueva categoría',
    description: 'Crea una categoría para el tenant actual',
  })
  @ApiResponse({ status: 201, description: 'Categoría creada con éxito.' })
  async create(@TenantId() tenantId: string, @Body() createCategoryDto: CreateCategoryDto) {
    if (!tenantId) {
      throw new BadRequestException('TenantId es requerido');
    }

    return this.categoryService.create({
      ...createCategoryDto,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Actualiza una categoría del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Categoría actualizada con éxito.' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar categoría',
    description: 'Elimina una categoría del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Categoría eliminada con éxito.' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.categoryService.remove(id, tenantId);
  }
}
