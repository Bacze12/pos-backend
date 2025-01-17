import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './sales.schema';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Module } from '@nestjs/common';
import { SaleItemModule } from '../saleItem/saleItem.module';
import { ShiftModule } from '../shift/shift.module';
import { SaleItem, SaleItemSchema } from '../saleItem/saleItem.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
    ]),
    ShiftModule,
    SaleItemModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [MongooseModule, SalesService],
})
export class SalesModule {}
