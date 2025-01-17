import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaleItem } from './saleItem.schema';

@Injectable()
export class SaleItemService {
  constructor(@InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>) {}

  async findAll(tenantId: string): Promise<SaleItem[]> {
    return this.saleItemModel.find({ tenantId }).exec();
  }

  async create(tenantId: string, saleItemData: any): Promise<SaleItem> {
    return new this.saleItemModel({ ...saleItemData, tenantId }).save();
  }

  async update(tenantId: string, saleItemId: string, updateData: any): Promise<SaleItem> {
    return this.saleItemModel
      .findOneAndUpdate({ _id: saleItemId, tenantId }, updateData, {
        new: true,
      })
      .exec();
  }

  async delete(tenantId: string, saleItemId: string): Promise<any> {
    return this.saleItemModel.deleteOne({ _id: saleItemId, tenantId }).exec();
  }
}
