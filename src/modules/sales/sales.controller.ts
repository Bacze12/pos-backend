import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSaleDto, UpdateSaleDto } from './sale.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('sales') // Agrupa los endpoints bajo "sales"
@ApiBearerAuth() // Indica que requieren autenticación JWT
@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get('')
  @ApiOperation({
    summary: 'Obtener todas las ventas',
    description: 'Devuelve una lista de todas las ventas asociadas al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Ventas recuperadas con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Falta el token JWT o es inválido.' })
  async getSales(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.findAll(tenantId);
  }

  @Get('shift/:shiftId')
  @ApiOperation({
    summary: 'Obtener ventas por turno',
    description: 'Devuelve las ventas asociadas a un turno específico del tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Ventas por turno recuperadas con éxito.' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado.' })
  async getSalesByShift(@Req() req, @Param('shiftId') shiftId: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.findByShift(tenantId, shiftId);
  }

  @Post('')
  @ApiOperation({
    summary: 'Crear una nueva venta',
    description: 'Crea una nueva venta asociada al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Venta creada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createSale(@Req() req, @Body() saleData: CreateSaleDto) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.create(tenantId, saleData);
  }

  @Put(':tenantId/:saleId')
  @ApiOperation({
    summary: 'Actualizar una venta',
    description: 'Actualiza los datos de una venta específica para el tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Venta actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  async updateSale(
    @Param('tenantId') tenantId: string,
    @Param('saleId') saleId: string,
    @Body() updateData: UpdateSaleDto,
  ) {
    return this.salesService.update(tenantId, saleId, updateData);
  }

  @Delete(':tenantId/:saleId')
  @ApiOperation({
    summary: 'Eliminar una venta',
    description: 'Elimina una venta asociada al tenant especificado.',
  })
  @ApiResponse({ status: 200, description: 'Venta eliminada con éxito.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  async deleteSale(@Param('tenantId') tenantId: string, @Param('saleId') saleId: string) {
    return this.salesService.delete(tenantId, saleId);
  }
}
