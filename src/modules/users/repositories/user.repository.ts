// src/users/repositories/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users.schema';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    return this.userModel.findOne({ email, tenantId }).lean().exec();
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userModel.find({ tenantId }).lean().exec();
  }

  async findById(id: string, tenantId?: string): Promise<User | null> {
    return this.userModel.findById(id, tenantId).lean().exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: userData.email,
      tenantId: userData.tenantId,
    });
    if (existingUser) {
      throw new ConflictException('El email ya está en uso para este tenant');
    }
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).lean().exec();
  }

  async updateByTenant(
    id: string,
    tenantId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
      .lean()
      .exec();
  }

  async delete(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).lean().exec();
    if (user) {
      await this.userModel.findByIdAndDelete(id).exec();
    }
    return user;
  }

  async deleteByTenant(id: string, tenantId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ _id: id, tenantId }).lean().exec();
    if (user) {
      await this.userModel.findOneAndDelete({ _id: id, tenantId }).exec();
    }
    return user;
  }

  // user.repository.ts
  async setActiveStatus(id: string, tenantId: string, isActive: boolean): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, { isActive }, { new: true })
      .exec();
  }

  async addSession(id: string, session: any): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $push: { activeSession: session } }, { new: true })
      .lean()
      .exec();
  }

  async removeSession(id: string, refreshToken: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $pull: { activeSession: { token: refreshToken } } }, { new: true })
      .lean()
      .exec();
  }
}
