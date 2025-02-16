import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../inventory.schema';
import { Product, ProductDocument } from '../../products/products.schema';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findProductById(productId: string): Promise<Product | null> {
    return this.productModel.findById(productId);
  }

  async updateProductStock(productId: string, newStock: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, { stock: newStock });
  }

  async saveInventoryMovement(inventory: InventoryDocument): Promise<Inventory> {
    return inventory.save();
  }

  async findAllInventory(): Promise<Inventory[]> {
    return this.inventoryModel.find().populate('productId').populate('userId').exec();
  }

  async findInventoryById(id: string): Promise<Inventory | null> {
    return this.inventoryModel.findById(id).populate('productId').populate('userId').exec();
  }

  createInventoryDocument(data: any): InventoryDocument {
    return new this.inventoryModel(data);
  }
}
