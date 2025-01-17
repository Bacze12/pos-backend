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
import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';

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
  async getSuppliers(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.suppliersService.findAll(tenantId);
  }

  @Post('')
  async createSupplier(@Req() req, @Body() supplierData: any) {
    const tenantId = this.getTenantIdFromRequest(req);
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
