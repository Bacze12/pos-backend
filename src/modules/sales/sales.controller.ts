import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSaleDto, UpdateSaleDto } from './sale.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('')
  @ApiOperation({
    summary: 'Obtener todas las ventas',
    description: 'Devuelve una lista de todas las ventas del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Ventas recuperadas con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getSales(@TenantId() tenantId: string) {
    return this.salesService.findAll(tenantId);
  }

  @Get('shift/:shiftId')
  @ApiOperation({
    summary: 'Obtener ventas por turno',
    description: 'Devuelve las ventas asociadas a un turno del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Ventas por turno recuperadas.' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado.' })
  async getSalesByShift(@TenantId() tenantId: string, @Param('shiftId') shiftId: string) {
    return this.salesService.findByShift(tenantId, shiftId);
  }

  @Post('')
  @ApiOperation({
    summary: 'Crear una nueva venta',
    description: 'Crea una nueva venta para el tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Venta creada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async createSale(@TenantId() tenantId: string, @Body() saleData: CreateSaleDto) {
    return this.salesService.create(tenantId, saleData);
  }

  @Put(':saleId')
  @ApiOperation({
    summary: 'Actualizar una venta',
    description: 'Actualiza una venta específica del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Venta actualizada.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  async updateSale(
    @TenantId() tenantId: string,
    @Param('saleId') saleId: string,
    @Body() updateData: UpdateSaleDto,
  ) {
    return this.salesService.update(tenantId, saleId, updateData);
  }

  @Delete(':saleId')
  @ApiOperation({
    summary: 'Eliminar una venta',
    description: 'Elimina una venta del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Venta eliminada.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  async deleteSale(@TenantId() tenantId: string, @Param('saleId') saleId: string) {
    return this.salesService.delete(tenantId, saleId);
  }
}
