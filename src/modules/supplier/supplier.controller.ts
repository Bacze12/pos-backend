import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  Req,
  Patch,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSupplierDto, UpdateSupplierDto } from './supplier.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('suppliers') // Agrupa los endpoints bajo "suppliers"
@ApiBearerAuth() // Requiere autenticación JWT
@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  constructor(private readonly suppliersService: SupplierService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get('')
  @ApiOperation({
    summary: 'Obtener todos los proveedores',
    description: 'Devuelve una lista de todos los proveedores asociados al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Lista de proveedores recuperada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Falta token JWT o es inválido.' })
  async getSuppliers(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.suppliersService.findAll(tenantId);
  }

  @Post('')
  @ApiOperation({
    summary: 'Crear un nuevo proveedor',
    description: 'Crea un nuevo proveedor para el tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Proveedor creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createSupplier(@Req() req, @Body() supplierData: CreateSupplierDto) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.suppliersService.create(tenantId, supplierData);
  }

  @Patch(':tenantId/:supplierId')
  @ApiOperation({
    summary: 'Actualizar un proveedor',
    description: 'Actualiza los datos de un proveedor existente para el tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado con éxito.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  async updateSupplier(
    @Param('tenantId') tenantId: string,
    @Param('supplierId') supplierId: string,
    @Body() updateData: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(tenantId, supplierId, updateData);
  }

  @Delete(':tenantId/:supplierId')
  @ApiOperation({
    summary: 'Eliminar un proveedor',
    description: 'Elimina un proveedor asociado al tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  async deleteSupplier(
    @Param('tenantId') tenantId: string,
    @Param('supplierId') supplierId: string,
  ) {
    return this.suppliersService.delete(tenantId, supplierId);
  }
}
