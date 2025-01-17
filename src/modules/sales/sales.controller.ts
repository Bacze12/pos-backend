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
  async getSales(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.findAll(tenantId);
  }

  @Get('shift/:shiftId')
  async getSalesByShift(@Req() req, @Param('shiftId') shiftId: string) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.findByShift(tenantId, shiftId);
  }

  @Post('')
  async createSale(@Req() req, @Body() saleData: any) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.salesService.create(tenantId, saleData);
  }

  @Put(':tenantId/:saleId')
  async updateSale(
    @Param('tenantId') tenantId: string,
    @Param('saleId') saleId: string,
    @Body() updateData: any,
  ) {
    return this.salesService.update(tenantId, saleId, updateData);
  }

  @Delete(':tenantId/:saleId')
  async deleteSale(@Param('tenantId') tenantId: string, @Param('saleId') saleId: string) {
    return this.salesService.delete(tenantId, saleId);
  }
}
