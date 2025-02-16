import { Injectable } from '@nestjs/common';
import { Inventory, InventoryMovementType } from './inventory.schema';
import { InventoryRepository } from './repository/inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async create(inventoryData: {
    productId: string;
    quantity: number;
    type: InventoryMovementType;
    userId: string;
  }): Promise<Inventory> {
    const { productId, quantity, type, userId } = inventoryData;

    // 1️⃣ Verificar que el producto existe
    const product = await this.inventoryRepository.findProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // 2️⃣ Si es una salida (OUT), verificar que hay suficiente stock
    if (type === InventoryMovementType.OUT && product.stock < quantity) {
      throw new Error('Stock insuficiente para realizar la salida');
    }

    // 3️⃣ Registrar el movimiento de inventario
    const newInventory = this.inventoryRepository.createInventoryDocument({
      productId,
      quantity,
      type,
      userId,
    });
    await this.inventoryRepository.saveInventoryMovement(newInventory);

    // 4️⃣ Actualizar el stock del producto
    const newStock =
      type === InventoryMovementType.IN ? product.stock + quantity : product.stock - quantity;
    await this.inventoryRepository.updateProductStock(productId, newStock);

    return newInventory;
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.findAllInventory();
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.inventoryRepository.findInventoryById(id);
  }
}
