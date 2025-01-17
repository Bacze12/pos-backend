import { Controller, Get, Post, Body, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get('')
  async getProducts(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.productsService.findAll(tenantId);
  }

  @Post('')
  async createProduct(@Req() req, @Body() productData: any) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.productsService.create({ ...productData, tenantId });
  }
}
