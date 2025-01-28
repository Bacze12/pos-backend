import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './products.schema';
import { Supplier } from '../supplier/supplier.schema';
import { PriceCalculator } from './utils/price-calculator';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
  ) {}

  // Crear producto con cálculos
  async create(productData: any) {
    const supplier = await this.supplierModel.findOne({ _id: productData.supplier });
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const calculatedPrices = PriceCalculator.calculatePrices(
      productData.purchasePrice,
      productData.marginPercent,
      productData.isIvaExempt,
      productData.hasExtraTax,
      productData.extraTaxRate,
    );

    const currentTimestamp = new Date();
    const product = new this.productModel({
      ...productData,
      ...calculatedPrices,
      createdAt: currentTimestamp,
    });

    const savedProduct = await product.save();

    // Actualizar proveedor con nuevo producto
    supplier.products.push(savedProduct._id as unknown as Types.ObjectId);
    await supplier.save();

    return product.save();
  }

  // Actualizar producto con cálculos
  async updateProduct(tenantId: string, productId: string, updateData: any) {
    const product = await this.productModel.findOne({ tenantId, _id: productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const calculatedPrices = PriceCalculator.calculatePrices(
      updateData.purchasePrice || product.purchasePrice,
      updateData.marginPercent || product.marginPercent,
      updateData.isIvaExempt ?? product.isIvaExempt,
      updateData.hasExtraTax ?? product.hasExtraTax,
      updateData.extraTaxRate ?? product.extraTaxRate,
    );

    return this.productModel.findOneAndUpdate(
      { tenantId, _id: productId },
      { ...updateData, ...calculatedPrices },
      { new: true },
    );
  }

  // Otros métodos existentes
  async findAll(tenantId: string): Promise<Product[]> {
    return this.productModel.find({ tenantId }).exec();
  }

  async findById(tenantId: string, productId: string) {
    return this.productModel.findOne({ tenantId, _id: productId }).exec();
  }

  async deleteProduct(tenantId: string, productId: string) {
    return this.productModel.findOneAndDelete({ tenantId, _id: productId }).exec();
  }
}
