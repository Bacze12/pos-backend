import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/inventory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument, InventoryMovementType } from './inventory.schema';
import { Product, ProductDocument } from '../products/products.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const { productId, quantity, type, userId: _userId } = createInventoryDto;

    // 1️⃣ Verificar que el producto existe
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // 2️⃣ Si es una salida (OUT), verificar que hay suficiente stock
    if (type === InventoryMovementType.OUT && product.stock < quantity) {
      throw new Error('Stock insuficiente para realizar la salida');
    }

    // 3️⃣ Registrar el movimiento de inventario
    const newInventory = new this.inventoryModel(createInventoryDto);
    await newInventory.save();

    // 4️⃣ Actualizar el stock del producto
    const newStock =
      type === InventoryMovementType.IN ? product.stock + quantity : product.stock - quantity;

    await this.productModel.findByIdAndUpdate(productId, { stock: newStock });

    return newInventory;
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryModel.find().populate('productId').populate('userId').exec();
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.inventoryModel.findById(id).populate('productId').populate('userId').exec();
  }
}
