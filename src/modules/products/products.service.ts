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

  /**
   * Creates a new product with calculated prices.
   * @param productData - The data for the new product.
   * @returns The created product.
   */
  async create(productData: any) {
    const supplier = await this.validateSupplier(productData.supplier);

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

    // Update supplier with new product
    supplier.products.push(savedProduct._id as unknown as Types.ObjectId);
    await supplier.save();

    return product.save();
  }

  /**
   * Validates the supplier by its ID.
   * @param supplierId - The ID of the supplier.
   * @returns The validated supplier.
   * @throws Error if the supplier is not found.
   */
  private async validateSupplier(supplierId: string) {
    const supplier = await this.supplierModel.findOne({ _id: supplierId });
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    return supplier;
  }

  /**
   * Updates an existing product with calculated prices.
   * @param tenantId - The ID of the tenant.
   * @param productId - The ID of the product to update.
   * @param updateData - The data to update the product with.
   * @returns The updated product.
   */
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

  /**
   * Retrieves all products for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @returns A list of products.
   */
  async findAll(tenantId: string): Promise<Product[]> {
    return this.productModel.find({ tenantId }).exec();
  }

  /**
   * Retrieves a product by its ID for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param productId - The ID of the product.
   * @returns The product.
   */
  async findById(tenantId: string, productId: string) {
    return this.productModel.findOne({ tenantId, _id: productId }).exec();
  }

  /**
   * Deletes a product by its ID for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param productId - The ID of the product.
   * @returns The deleted product.
   */
  async deleteProduct(tenantId: string, productId: string) {
    return this.productModel.findOneAndDelete({ tenantId, _id: productId }).exec();
  }
}
