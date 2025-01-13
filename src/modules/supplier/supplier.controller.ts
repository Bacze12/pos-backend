import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  constructor(private readonly suppliersService: SupplierService) {}

  @Get(':tenantId')
  async getSuppliers(@Param('tenantId') tenantId: string, @Query() query: any) {
    return this.suppliersService.findAll(tenantId, query);
  }

  @Post(':tenantId')
  async createSupplier(@Param('tenantId') tenantId: string, @Body() supplierData: any) {
    return this.suppliersService.create(tenantId, supplierData);
  }

  @Put(':tenantId/:supplierId')
  async updateSupplier(
    @Param('tenantId') tenantId: string,
    @Param('supplierId') supplierId: string,
    @Body() updateData: any,
  ) {
    return this.suppliersService.update(tenantId, supplierId, updateData);
  }

  @Delete(':tenantId/:supplierId')
  async deleteSupplier(
    @Param('tenantId') tenantId: string,
    @Param('supplierId') supplierId: string,
  ) {
    return this.suppliersService.delete(tenantId, supplierId);
  }
}
