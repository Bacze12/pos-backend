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

  async findAll(tenantId: string): Promise<Sale[]> {
    return this.saleModel.find({ tenantId }).exec();
  }

  async create(tenantId: string, saleData: any): Promise<Sale> {
    const session = await this.saleModel.db.startSession();
    session.startTransaction();

    try {
      const { shift, items, ...saleDetails } = saleData;

      // Verificar que el shift está abierto
      const currentShift = await this.shiftModel.findOne({
        _id: shift,
        tenantId,
        status: 'OPEN',
      });

      if (!currentShift) {
        throw new Error('El turno no está abierto o no existe');
      }

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

  async findByShift(tenantId: string, shiftId: string): Promise<Sale[]> {
    return this.saleModel.find({ tenantId, shift: shiftId }).exec();
  }
}
