import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SaleItemService } from './saleItem.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@Controller('saleItems')
@UseGuards(AuthGuard('jwt'))
export class SaleItemsController {
  constructor(private readonly saleItemService: SaleItemService) {}

  @Get('')
  async getSaleItems(@TenantId() tenantId: string) {
    return this.saleItemService.findAll(tenantId);
  }

  @Post('')
  async createSaleItem(@TenantId() tenantId: string, @Body() saleItemData: any) {
    return this.saleItemService.create(tenantId, saleItemData);
  }

  @Put(':saleItemId')
  async updateSaleItem(
    @TenantId() tenantId: string,
    @Param('saleItemId') saleItemId: string,
    @Body() updateData: any,
  ) {
    return this.saleItemService.update(tenantId, saleItemId, updateData);
  }

  @Delete(':saleItemId')
  async deleteSaleItem(@TenantId() tenantId: string, @Param('saleItemId') saleItemId: string) {
    return this.saleItemService.delete(tenantId, saleItemId);
  }
}
