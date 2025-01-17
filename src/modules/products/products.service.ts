import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './products.schema';
import { Supplier } from '../supplier/supplier.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
  ) {}

  // Lógica para calcular precios
  private calculatePrices(
    purchasePrice: number,
    marginPercent: number,
    isIvaExempt: boolean,
    hasExtraTax: boolean,
    extraTaxRate?: number,
  ) {
    const marginMultiplier = 1 + marginPercent / 100;
    const sellingPrice = purchasePrice * marginMultiplier;

    const minMarginMultiplier = 1.1; // 10% margen mínimo
    const minSellingPrice = purchasePrice * minMarginMultiplier;

    let finalPrice = sellingPrice;
    if (!isIvaExempt) {
      finalPrice *= 1.19; // IVA 19%
    }
    if (hasExtraTax && extraTaxRate) {
      finalPrice *= 1 + extraTaxRate / 100;
    }

    return {
      sellingPrice: Number(sellingPrice.toFixed(2)),
      minSellingPrice: Number(minSellingPrice.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  // Crear producto con cálculos
  async create(productData: any) {
    const supplier = await this.supplierModel.findOne({ _id: productData.supplier });
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const calculatedPrices = this.calculatePrices(
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

    const calculatedPrices = this.calculatePrices(
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
