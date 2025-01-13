import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from './supplier.schema';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
  ) {}

  async findAll(tenantId: string, query: any): Promise<Supplier[]> {
    return this.supplierModel.find({ tenantId }).exec();
  }

  async create(tenantId: string, supplierData: any): Promise<Supplier> {
    return new this.supplierModel({ ...supplierData, tenantId }).save();
  }

  async update(
    tenantId: string,
    supplierId: string,
    updateData: any,
  ): Promise<Supplier> {
    return this.supplierModel
      .findOneAndUpdate({ _id: supplierId, tenantId }, updateData, {
        new: true,
      })
      .exec();
  }

  async delete(tenantId: string, supplierId: string): Promise<any> {
    return this.supplierModel.deleteOne({ _id: supplierId, tenantId }).exec();
  }
}
