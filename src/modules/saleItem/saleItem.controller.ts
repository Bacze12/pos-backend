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
import { SaleItemService } from './saleItem.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('saleItems')
@UseGuards(AuthGuard('jwt'))
export class SaleItemsController {
  constructor(private readonly saleItemService: SaleItemService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get('')
  async getSaleItems(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.saleItemService.findAll(tenantId);
  }

  @Post('')
  async createSaleItem(@Req() req, @Body() saleItemData: any) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.saleItemService.create(tenantId, saleItemData);
  }

  @Put(':tenantId/:saleItemId')
  async updateSaleItem(
    @Param('tenantId') tenantId: string,
    @Param('saleItemId') saleItemId: string,
    @Body() updateData: any,
  ) {
    return this.saleItemService.update(tenantId, saleItemId, updateData);
  }

  @Delete(':tenantId/:saleItemId')
  async deleteSaleItem(
    @Param('tenantId') tenantId: string,
    @Param('saleItemId') saleItemId: string,
  ) {
    return this.saleItemService.delete(tenantId, saleItemId);
  }
}
