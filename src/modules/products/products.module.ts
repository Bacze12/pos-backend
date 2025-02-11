import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './products.schema';
import { Supplier, SupplierSchema } from '../supplier/supplier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductsService,
  ],
})
export class ProductsModule {}
