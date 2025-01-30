import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from './sales.schema';
import { SaleItem } from '../saleItem/saleItem.schema';
import { Shift } from '../shift/shift.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>,
    @InjectModel(Shift.name) private shiftModel: Model<Shift>,
  ) {}

  /**
   * Retrieves all sales for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @returns A list of sales.
   */
  async findAll(tenantId: string): Promise<Sale[]> {
    return this.saleModel.find({ tenantId }).exec();
  }

  /**
   * Creates a new sale with associated sale items and updates the shift.
   * @param tenantId - The ID of the tenant.
   * @param saleData - The data for the new sale.
   * @returns The created sale.
   */
  async create(tenantId: string, saleData: any): Promise<Sale> {
    const session = await this.saleModel.db.startSession();
    session.startTransaction();

    try {
      const { shift, items, ...saleDetails } = saleData;

      // Verificar que el shift está abierto
      const currentShift = await this.validateShift(tenantId, shift);

      // Crear la venta con la fecha actual
      const sale = new this.saleModel({
        ...saleDetails,
        tenantId,
        shift,
        createdAt: new Date(),
      });
      const savedSale = await sale.save({ session });

      // Crear los SaleItems con referencia a la venta
      const saleItems = await Promise.all(
        items.map(async (item) => {
          return new this.saleItemModel({
            ...item,
            tenantId,
            sale: savedSale._id,
          }).save({ session });
        }),
      );

      // Actualizar la venta con los IDs de los items
      savedSale.items = saleItems.map((item) => item._id);
      await savedSale.save({ session });

      // Actualizar el Shift para incluir esta venta
      await this.shiftModel.findByIdAndUpdate(
        shift,
        { $push: { sales: savedSale._id } },
        { session },
      );

      await session.commitTransaction();
      return savedSale;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error creando la venta: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Validates the shift by its ID and tenant ID.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift.
   * @returns The validated shift.
   * @throws Error if the shift is not found or not open.
   */
  private async validateShift(tenantId: string, shiftId: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      tenantId,
      status: 'OPEN',
    });

    if (!shift) {
      throw new Error('El turno no está abierto o no existe');
    }

    return shift;
  }

  /**
   * Updates an existing sale with associated sale items.
   * @param tenantId - The ID of the tenant.
   * @param saleId - The ID of the sale to update.
   * @param updateData - The data to update the sale with.
   * @returns The updated sale.
   */
  async update(tenantId: string, saleId: string, updateData: any): Promise<Sale> {
    const session = await this.saleModel.db.startSession();
    session.startTransaction();

    try {
      const { items, ...saleDetails } = updateData;

      if (items) {
        // Actualiza o reemplaza los SaleItem existentes
        await Promise.all(
          items.map(async (item) => {
            return this.saleItemModel.findOneAndUpdate(
              { _id: item._id, tenantId },
              { ...item },
              { upsert: true, session },
            );
          }),
        );
      }

      const updatedSale = await this.saleModel.findOneAndUpdate(
        { _id: saleId, tenantId },
        saleDetails,
        { new: true, session },
      );

      await session.commitTransaction();
      session.endSession();

      return updatedSale;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Error actualizando la venta: ${error.message}`);
    }
  }

  /**
   * Deletes a sale and its associated sale items.
   * @param tenantId - The ID of the tenant.
   * @param saleId - The ID of the sale to delete.
   * @returns The result of the deletion.
   */
  async delete(tenantId: string, saleId: string): Promise<any> {
    const session = await this.saleModel.db.startSession();
    session.startTransaction();

    try {
      // Elimina los SaleItem relacionados
      await this.saleItemModel.deleteMany({ sale: saleId, tenantId }, { session });

      // Elimina la venta
      const result = await this.saleModel.deleteOne({ _id: saleId, tenantId }, { session });

      await session.commitTransaction();
      session.endSession();

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Error eliminando la venta: ${error.message}`);
    }
  }

  /**
   * Retrieves sales by shift ID for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift.
   * @returns A list of sales.
   */
  async findByShift(tenantId: string, shiftId: string): Promise<Sale[]> {
    return this.saleModel.find({ tenantId, shift: shiftId }).exec();
  }
}
