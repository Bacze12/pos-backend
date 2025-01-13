import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../modules/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../modules/users/users.schema';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  /* eslint-disable @typescript-eslint/no-unused-vars */
  let model: Model<User>;

  // Mock de un usuario para pruebas
  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com',
    password: 'hashedPassword',
    tenantId: 'mockTenantId',
    role: 'CASHIER',
    name: 'Test User',
    isActive: true,
    sales: [],
    shifts: [],
  };

  // Configuración del mock del modelo
  const mockUserModel = function (dto) {
    return {
      ...dto,
      _id: 'newMockUserId', // Aseguramos que el ID sea 'newMockUserId'
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: 'newMockUserId', // ID consistente aquí también
      }),
    };
  };

  // Configuración de métodos del modelo
  mockUserModel.find = jest.fn().mockReturnThis();
  mockUserModel.findOne = jest.fn().mockReturnThis();
  mockUserModel.findOneAndUpdate = jest.fn().mockReturnThis();
  mockUserModel.findOneAndDelete = jest.fn().mockReturnThis();
  mockUserModel.exec = jest.fn();

  // Configuración inicial antes de cada prueba
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  // Limpieza después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para findByEmailAndTenant
  describe('findByEmailAndTenant', () => {
    it('debería encontrar un usuario por email y tenantId', async () => {
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await service.findByEmailAndTenant('test@example.com', 'mockTenantId');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
        tenantId: 'mockTenantId',
      });
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si no encuentra el usuario', async () => {
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      const result = await service.findByEmailAndTenant('nonexistent@example.com', 'mockTenantId');

      expect(result).toBeNull();
    });
  });

  // Pruebas para findAllByTenant
  describe('findAllByTenant', () => {
    it('debería encontrar todos los usuarios de un tenant', async () => {
      const mockUsers = [mockUser, { ...mockUser, email: 'test2@example.com' }];

      mockUserModel.find.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUsers),
      }));

      const result = await service.findAllByTenant('mockTenantId');

      expect(mockUserModel.find).toHaveBeenCalledWith({
        tenantId: 'mockTenantId',
      });
      expect(result).toEqual(mockUsers);
    });

    it('debería lanzar NotFoundException si no se proporciona tenantId', async () => {
      await expect(service.findAllByTenant('')).rejects.toThrow(NotFoundException);
    });
  });

  // Pruebas para findById
  describe('findById', () => {
    it('debería encontrar un usuario por id y tenantId', async () => {
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await service.findById('mockUserId', 'mockTenantId');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        _id: 'mockUserId',
        tenantId: 'mockTenantId',
      });
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si no encuentra el usuario', async () => {
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.findById('nonexistentId', 'mockTenantId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Pruebas para create
  describe('create', () => {
    it('debería crear un nuevo usuario exitosamente', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        tenantId: 'mockTenantId',
        role: 'CASHIER',
        name: 'New User',
        isActive: true,
      };

      // Mock del findOne para verificar si existe el usuario
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      const result = await service.create(userData);

      // Verificaciones
      expect(result).toHaveProperty('_id', 'newMockUserId');
      expect(result.email).toBe(userData.email);
      expect(result.tenantId).toBe(userData.tenantId);
    });
    it('debería lanzar BadRequestException si falta el tenantId', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      await expect(service.create(userData)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si el email ya existe para ese tenant', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        tenantId: 'mockTenantId',
        name: 'Existing User',
      };

      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      await expect(service.create(userData)).rejects.toThrow(ConflictException);
    });
  });

  // Pruebas para update
  describe('update', () => {
    it('debería actualizar un usuario exitosamente', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, ...updateData };

      mockUserModel.findOneAndUpdate.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(updatedUser),
      }));

      const result = await service.update('mockUserId', updateData, 'mockTenantId');

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'mockUserId', tenantId: 'mockTenantId' },
        updateData,
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('debería lanzar NotFoundException si no encuentra el usuario para actualizar', async () => {
      mockUserModel.findOneAndUpdate.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.update('nonexistentId', {}, 'mockTenantId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Pruebas para delete
  describe('delete', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      mockUserModel.findOneAndDelete.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await service.delete('mockUserId', 'mockTenantId');

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'mockUserId',
        tenantId: 'mockTenantId',
      });
      expect(result).toEqual({ message: 'Usuario eliminado con éxito' });
    });

    it('debería lanzar NotFoundException si no encuentra el usuario para eliminar', async () => {
      mockUserModel.findOneAndDelete.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.delete('nonexistentId', 'mockTenantId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
