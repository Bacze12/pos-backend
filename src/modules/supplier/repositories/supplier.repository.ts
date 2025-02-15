// supplier.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from '../supplier.schema';

@Injectable()
export class SupplierRepository {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<Supplier>) {}

  async findAll(tenantId: string): Promise<Supplier[]> {
    return this.supplierModel.find({ tenantId }).exec();
  }

  async findById(tenantId: string, supplierId: string): Promise<Supplier> {
    return this.supplierModel.findOne({ _id: supplierId, tenantId }).exec();
  }

  async create(tenantId: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const supplier = new this.supplierModel({
      ...supplierData,
      tenantId,
    });
    return supplier.save();
  }

  async update(
    tenantId: string,
    supplierId: string,
    updateData: Partial<Supplier>,
  ): Promise<Supplier> {
    return this.supplierModel
      .findOneAndUpdate({ _id: supplierId, tenantId }, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(tenantId: string, supplierId: string): Promise<boolean> {
    const result = await this.supplierModel.deleteOne({ _id: supplierId, tenantId }).exec();
    return result.deletedCount > 0;
  }
}
