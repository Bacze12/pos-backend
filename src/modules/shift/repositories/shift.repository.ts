import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift } from '../shift.schema';
import { User } from '../../users/users.schema';
import { Sale } from '../../sales/sales.schema';

@Injectable()
export class ShiftRepository {
  constructor(
    @InjectModel(Shift.name) private readonly shiftModel: Model<Shift>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
  ) {}

  async findAll(tenantId: string): Promise<Shift[]> {
    return this.shiftModel.find({ tenantId }).exec();
  }

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

  async update(tenantId: string, shiftId: string, updateData: any): Promise<Shift> {
    return this.shiftModel
      .findOneAndUpdate({ _id: shiftId, tenantId }, updateData, { new: true })
      .exec();
  }

  async delete(tenantId: string, shiftId: string): Promise<any> {
    return this.shiftModel.deleteOne({ _id: shiftId, tenantId }).exec();
  }

  async findOpenShift(tenantId: string, email: string, shiftId: string): Promise<Shift> {
    return this.shiftModel
      .findOne({ _id: shiftId, tenantId, status: 'OPEN', createdBy: email })
      .exec();
  }

  async getShiftSales(tenantId: string, shiftId: string, startTime: Date) {
    return this.saleModel
      .find({
        tenantId,
        shift: shiftId,
        createdAt: { $gte: startTime, $lte: new Date() },
      })
      .exec();
  }

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
