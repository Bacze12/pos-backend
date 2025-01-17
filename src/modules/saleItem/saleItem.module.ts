import { MongooseModule } from '@nestjs/mongoose';
import { SaleItem, SaleItemSchema } from './saleItem.schema';
import { SaleItemsController } from './saleItem.controller';
import { SaleItemService } from './saleItem.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [MongooseModule.forFeature([{ name: SaleItem.name, schema: SaleItemSchema }])],
  controllers: [SaleItemsController],
  providers: [SaleItemService],
  exports: [MongooseModule, SaleItemService],
})
export class SaleItemModule {}
