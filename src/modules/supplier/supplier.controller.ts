import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSupplierDto, UpdateSupplierDto } from './supplier.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  constructor(private readonly suppliersService: SupplierService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los proveedores',
    description: 'Devuelve proveedores del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Lista de proveedores recuperada con éxito.' })
  async getSuppliers(@TenantId() tenantId: string) {
    return this.suppliersService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo proveedor',
    description: 'Crea un proveedor para el tenant actual',
  })
  @ApiResponse({ status: 201, description: 'Proveedor creado con éxito.' })
  async createSupplier(@TenantId() tenantId: string, @Body() supplierData: CreateSupplierDto) {
    return this.suppliersService.create(tenantId, supplierData);
  }

  @Patch(':supplierId')
  @ApiOperation({
    summary: 'Actualizar un proveedor',
    description: 'Actualiza un proveedor del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado con éxito.' })
  async updateSupplier(
    @TenantId() tenantId: string,
    @Param('supplierId') supplierId: string,
    @Body() updateData: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(tenantId, supplierId, updateData);
  }

  @Delete(':supplierId')
  @ApiOperation({
    summary: 'Eliminar un proveedor',
    description: 'Elimina un proveedor del tenant actual',
  })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado con éxito.' })
  async deleteSupplier(@TenantId() tenantId: string, @Param('supplierId') supplierId: string) {
    return this.suppliersService.delete(tenantId, supplierId);
  }
}
