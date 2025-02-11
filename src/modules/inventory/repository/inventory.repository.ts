import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../inventory.schema';
import { CreateInventoryDto } from '../dto/inventory.dto';

@Injectable()
export class InventoryRepository {
  constructor(@InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const newInventory = new this.inventoryModel(createInventoryDto);
    return newInventory.save();
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryModel.find().populate('productId').exec();
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.inventoryModel.findById(id).populate('productId').exec();
  }
}
