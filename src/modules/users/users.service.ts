import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { User } from './users.schema';
import { hashPassword } from '../../middleware/crypto.middleware';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository, // Inyecta UsersRepository
    // @InjectModel(User.name) private userModel: Model<User> // ELIMINADO
  ) {}
  private readonly logger = new Logger(UsersService.name);

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    this.logger.log(`Buscando usuario con email: ${email} y tenantId: ${tenantId}`);
    return this.usersRepository.findByEmailAndTenant(email, tenantId); // Usa UsersRepository
  }

  async findAllByTenant(tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException('El tenantId es obligatorio.');
    }
    this.logger.log(`Buscando todos los usuarios del tenantId: ${tenantId}`);
    return this.usersRepository.findAllByTenant(tenantId); // Usa UsersRepository
  }

  async findById(id: string, tenantId?: string) {
    this.logger.log(`Buscando usuario con id: ${id}`);
    const user = await this.usersRepository.findById(id, tenantId); // Usa UsersRepository
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(userData: any) {
    try {
      this.logger.debug('Creating user with data:', userData);

      if (!userData.tenantId) {
        throw new BadRequestException('El tenantId es requerido');
      }

      if (!userData.name) {
        throw new BadRequestException('El nombre es requerido');
      }

      // Validar que todos los campos requeridos estén presentes
      const requiredFields = ['email', 'password', 'role'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new BadRequestException(`El campo ${field} es requerido`);
        }
      }

      const userExists = await this.usersRepository.findByEmailAndTenant(
        userData.email,
        userData.tenantId,
      );

      if (userExists) {
        throw new ConflictException('El email ya está en uso para este tenant');
      }

      const hashedPassword = hashPassword(userData.password);

      const savedUser = await this.usersRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
      });

      this.logger.debug('User created successfully:', {
        id: savedUser._id,
        email: savedUser.email,
      });

      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getAll(tenantId: string) {
    this.logger.log(`Buscando todos los usuarios para tenantId: ${tenantId}`);
    return this.usersRepository.getAll(tenantId); // Usa UsersRepository
  }

  async update(id: string, updateData: any, tenantId: string) {
    this.logger.log(
      `Intentando actualizar usuario con id: ${id} para tenantId: ${tenantId}`,
      updateData,
    );

    if (updateData.password) {
      this.logger.log('Hashing new password before updating user');
      updateData.password = hashPassword(updateData.password);
    }

    const user = await this.usersRepository.update(id, updateData, tenantId); // Usa UsersRepository

    if (!user) {
      this.logger.error(`Usuario con id: ${id} no encontrado para tenantId: ${tenantId}`);
      throw new NotFoundException('Usuario no encontrado para este tenant.');
    }

    this.logger.log(`Usuario actualizado con éxito:`, user);
    return user;
  }

  async delete(id: string, tenantId: string) {
    this.logger.log(`Intentando eliminar usuario con id: ${id} para tenantId: ${tenantId}`);

    try {
      const user = await this.usersRepository.findById(id, tenantId);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado para este tenant.');
      }

      await this.usersRepository.delete(id, tenantId);
      this.logger.log(`Usuario eliminado con éxito.`);
      return { message: 'Usuario eliminado con éxito' };
    } catch (error) {
      this.logger.error(`Error al eliminar usuario:`, error);
      throw error;
    }
  }

  async active(id: string, tenantId: string, isActive: boolean) {
    const user = await this.usersRepository.active(id, tenantId, isActive); // Usa UsersRepository

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    } // ELIMINADO: Ya no es necesario, el Repository guarda
    // const updatedUser = await user.save();
    return user; // Retorna directamente el usuario actualizado del Repository
  }
  catch(error) {
    throw new Error(`Error al actualizar el estado del usuario: ${error.message}`);
  }
}
