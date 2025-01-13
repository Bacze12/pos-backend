import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { hashPassword } from '../../middleware/crypto.middleware';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmailAndTenant(
    email: string,
    tenantId: string,
  ): Promise<User | null> {
    console.log(`Buscando usuario con email: ${email} y tenantId: ${tenantId}`);
    return this.userModel.findOne({ email, tenantId }).exec();
  }

  async findAllByTenant(tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException('El tenantId es obligatorio.');
    }
    console.log(`Buscando todos los usuarios del tenantId: ${tenantId}`);
    return this.userModel.find({ tenantId }).exec();
  }

  async findById(id: string, tenantId: string) {
    console.log(`Buscando usuario con id: ${id} y tenantId: ${tenantId}`);
    const user = await this.userModel.findOne({ _id: id, tenantId }).exec();
    if (!user) {
      console.error(
        `Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`,
      );
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }
    return user;
  }

  async create(userData: any) {
    if (!userData.tenantId) {
      throw new BadRequestException('El tenantId es requerido');
    }

    const userExists = await this.userModel
      .findOne({
        email: userData.email,
        tenantId: userData.tenantId,
      })
      .exec();

    if (userExists) {
      throw new ConflictException('El email ya está en uso para este tenant');
    }
    console.log(
      `Creando usuario para tenantId: ${userData.tenantId}`,
      userData,
    );
    try {
      // Hashea la contraseña antes de guardarla
      if (userData.password) {
        userData.password = hashPassword(userData.password);
      }

      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      console.error('Error al crear el usuario:', error.message);
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  }

  async update(id: string, updateData: any, tenantId: string) {
    console.log(
      `Intentando actualizar usuario con id: ${id} para tenantId: ${tenantId}`,
      updateData,
    );

    const user = await this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
      .exec();
    if (!user) {
      console.error(
        `Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`,
      );
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }
    console.log(`Usuario actualizado con éxito:`, user);
    return user;
  }

  async delete(id: string, tenantId: string) {
    console.log(
      `Intentando eliminar usuario con id: ${id} para tenantId: ${tenantId}`,
    );

    const user = await this.userModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();
    if (!user) {
      console.error(
        `Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`,
      );
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }
    console.log(`Usuario eliminado con éxito.`);
    return { message: 'Usuario eliminado con éxito' };
  }
}
