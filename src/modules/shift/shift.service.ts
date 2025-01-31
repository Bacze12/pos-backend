import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift } from './shift.schema';
import { User } from '../users/users.schema';
import { Sale } from '../sales/sales.schema';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<Shift>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
  ) {}

  /**
   * Retrieves all shifts for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @returns A list of shifts.
   */
  async findAll(tenantId: string): Promise<Shift[]> {
    return this.shiftModel.find({ tenantId }).exec();
  }

  /**
   * Creates a new shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param email - The email of the user creating the shift.
   * @param shiftData - The data for the new shift.
   * @returns The created shift.
   */
  async create(tenantId: string, email: string, shiftData: any): Promise<Shift> {
    const newShift = new this.shiftModel({
      ...shiftData,
      tenantId,
      createdBy: email,
      status: 'OPEN',
      sales: [],
    });
    return newShift.save();
  }

  /**
   * Updates an existing shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift to update.
   * @param updateData - The data to update the shift with.
   * @returns The updated shift.
   */
  async update(tenantId: string, shiftId: string, updateData: any): Promise<Shift> {
    return this.shiftModel
      .findOneAndUpdate({ _id: shiftId, tenantId }, updateData, {
        new: true,
      })
      .exec();
  }

  /**
   * Deletes a shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift to delete.
   * @returns The result of the deletion.
   */
  async delete(tenantId: string, shiftId: string): Promise<any> {
    return this.shiftModel.deleteOne({ _id: shiftId, tenantId }).exec();
  }

  /**
   * Closes a shift for a given tenant and user.
   * @param tenantId - The ID of the tenant.
   * @param email - The email of the user closing the shift.
   * @param shiftId - The ID of the shift to close.
   * @param finalCash - The final cash amount at the end of the shift.
   * @returns The closed shift.
   */
  async closeShift(
    tenantId: string,
    email: string,
    shiftId: string,
    finalCash: number,
  ): Promise<Shift> {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      tenantId,
      status: 'OPEN',
      createdBy: email,
    });

    if (!shift) {
      throw new Error('Shift no encontrado, ya está cerrado o usuario no autorizado');
    }

    const shiftSales = await this.getShiftSales(tenantId, shiftId, shift.startTime);

    shift.status = 'CLOSED';
    shift.finalCash = finalCash;
    shift.endTime = new Date();
    shift.sales = shiftSales.map((sale) => sale._id as Types.ObjectId);

    return shift.save();
  }

  /**
   * Retrieves sales for a given shift.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift.
   * @param startTime - The start time of the shift.
   * @returns A list of sales for the shift.
   */
  private async getShiftSales(tenantId: string, shiftId: string, startTime: Date) {
    return this.saleModel.find({
      tenantId,
      shift: shiftId,
      createdAt: {
        $gte: startTime,
        $lte: new Date(),
      },
    });
  }

  /**
   * Assigns users to a shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift.
   * @param userIds - The IDs of the users to assign to the shift.
   * @returns The updated shift with assigned users.
   */
  async assignUsersToShift(tenantId: string, shiftId: string, userIds: string[]): Promise<Shift> {
    const shift = await this.shiftModel.findOne({ _id: shiftId, tenantId }).exec();
    if (!shift) {
      throw new Error('Shift no encontrado');
    }

    const validUsers = await this.userModel.find({ _id: { $in: userIds }, tenantId }).exec();
    if (validUsers.length !== userIds.length) {
      throw new Error('Uno o más usuarios no son válidos o no pertenecen al tenant.');
    }

    shift.users = [...shift.users, ...validUsers.map((user) => user._id as Types.ObjectId)];

    return shift.save();
  }
}
