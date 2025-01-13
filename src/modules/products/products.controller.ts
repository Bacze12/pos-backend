import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':tenantId')
  async getProducts(@Param('tenantId') tenantId: string, @Query() query: any) {
    return this.productsService.findAll(tenantId, query);
  }

  @Post(':tenantId')
  async createProduct(
    @Param('tenantId') tenantId: string,
    @Body() productData: any,
  ) {
    return this.productsService.create({ ...productData, tenantId });
  }
}
