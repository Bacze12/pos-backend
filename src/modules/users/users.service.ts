import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { hashPassword } from '../../middleware/crypto.middleware';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  private readonly logger = new Logger(UsersService.name);

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    this.logger.log(`Buscando usuario con email: ${email} y tenantId: ${tenantId}`);
    return this.userModel.findOne({ email, tenantId }).exec();
  }

  async findAllByTenant(tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException('El tenantId es obligatorio.');
    }
    this.logger.log(`Buscando todos los usuarios del tenantId: ${tenantId}`);
    return this.userModel.find({ tenantId }).exec();
  }

  async updateUser(id: string, updateData: Partial<User>) {
    this.logger.log(`Actualizando usuario con id: ${id}`, updateData);

    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // También agrega un método para buscar por ID sin tenant
  async findById(id: string, tenantId?: string) {
    this.logger.log(`Buscando usuario con id: ${id}`);
    const user = await this.userModel.findOne({ _id: id, tenantId }).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
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
    this.logger.log(`Creando usuario para tenantId: ${userData.tenantId}`, userData);
    try {
      // Hashea la contraseña antes de guardarla
      if (userData.password) {
        userData.password = hashPassword(userData.password);
      }

      const newUser = new this.userModel(userData);
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      this.logger.error('Error al crear el usuario:', error.message);
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  }

  async update(id: string, updateData: any, tenantId: string) {
    this.logger.log(
      `Intentando actualizar usuario con id: ${id} para tenantId: ${tenantId}`,
      updateData,
    );

    // Verificar si la contraseña está presente y hashearla antes de actualizar
    if (updateData.password) {
      this.logger.log('Hashing new password before updating user');
      updateData.password = hashPassword(updateData.password);
    }

    const user = await this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
      .exec();

    if (!user) {
      this.logger.error(`Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`);
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }

    this.logger.log(`Usuario actualizado con éxito:`, user);
    return user;
  }

  async delete(id: string, tenantId: string) {
    this.logger.log(`Intentando eliminar usuario con id: ${id} para tenantId: ${tenantId}`);

    const user = await this.userModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!user) {
      this.logger.error(`Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`);
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }
    this.logger.log(`Usuario eliminado con éxito.`);
    return { message: 'Usuario eliminado con éxito' };
  }
  async active(id: string, tenantId: string, isActive: boolean) {
    // Find user without checking current isActive status
    const user = await this.userModel
      .findOne({
        _id: id,
        tenantId,
      })
      .exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Set new active status
    user.isActive = isActive;

    try {
      // Save and return updated user
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      throw new Error(`Error al actualizar el estado del usuario: ${error.message}`);
    }
  }
}
