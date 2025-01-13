import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './products.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async findAll(tenantId: string, query: any) {
    return this.productModel.find({ tenantId, ...query }).exec();
  }

  async create(productData: any) {
    const product = new this.productModel(productData);
    return product.save();
  }

  async findById(tenantId: string, productId: string) {
    return this.productModel.findOne({ tenantId, _id: productId }).exec();
  }

  async updateProduct(tenantId: string, productId: string, updateData: any) {
    return this.productModel.findOneAndUpdate(
      { tenantId, _id: productId },
      updateData,
      { new: true },
    );
  }

  async deleteProduct(tenantId: string, productId: string) {
    return this.productModel
      .findOneAndDelete({ tenantId, _id: productId })
      .exec();
  }
}
