import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    return this.userModel.findOne({ email, tenantId }).exec();
  }

  async findAllByTenant(tenantId: string) {
    return this.userModel.find({ tenantId }).exec();
  }

  async findById(id: string, tenantId?: string) {
    return this.userModel.findOne({ _id: id, tenantId }).exec();
  }

  async getAll(tenantId: string) {
    return this.userModel.find({ tenantId }).exec();
  }

  async create(userData: any) {
    // OJO: Recibe userData "crudo", UsersService hará validación DTO
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async update(id: string, updateData: any, tenantId: string) {
    // OJO: Recibe updateData "crudo"
    return this.userModel.findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true }).exec();
  }

  async delete(id: string, tenantId: string) {
    return this.userModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  async active(id: string, tenantId: string, isActive: boolean) {
    const user = await this.userModel
      .findOne({
        _id: id,
        tenantId,
      })
      .exec();
    if (user) {
      // Añadido para evitar error si user es null
      user.isActive = isActive;
      return user.save();
    }
    return null; // Devuelve null si el usuario no se encuentra (UsersService manejará el error)
  }
}
