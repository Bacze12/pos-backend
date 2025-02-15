import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../modules/users/users.service';
import { UsersRepository } from '../../modules/users/repositories/users.repository';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { hashPassword } from '../../middleware/crypto.middleware';

jest.mock('../../middleware/crypto.middleware', () => ({
  hashPassword: jest.fn().mockReturnValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let _repository: UsersRepository;

  const mockUsersRepository = {
    findByEmailAndTenant: jest.fn(),
    findAllByTenant: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    active: jest.fn(),
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmailAndTenant', () => {
    it('should return a user when found', async () => {
      const mockUser = { email: 'test@test.com', tenantId: '1' };
      mockUsersRepository.findByEmailAndTenant.mockResolvedValue(mockUser);

      const result = await service.findByEmailAndTenant('test@test.com', '1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAllByTenant', () => {
    it('should throw NotFoundException when tenantId is not provided', async () => {
      await expect(service.findAllByTenant('')).rejects.toThrow(NotFoundException);
    });

    it('should return users when tenantId is valid', async () => {
      const mockUsers = [{ id: '1', name: 'Test' }];
      mockUsersRepository.findAllByTenant.mockResolvedValue(mockUsers);

      const result = await service.findAllByTenant('1');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException when required fields are missing', async () => {
      const userData = { email: 'test@test.com' };
      await expect(service.create(userData)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already exists', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
        role: 'user',
        tenantId: '1',
      };
      mockUsersRepository.findByEmailAndTenant.mockResolvedValue({ id: '1' });

      await expect(service.create(userData)).rejects.toThrow(ConflictException);
    });

    it('should create user successfully', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
        role: 'user',
        tenantId: '1',
      };
      const savedUser = { ...userData, _id: '1', password: 'hashedPassword' };
      mockUsersRepository.findByEmailAndTenant.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(savedUser);

      const result = await service.create(userData);
      expect(result).toEqual(savedUser);
      expect(hashPassword).toHaveBeenCalledWith(userData.password);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.update.mockResolvedValue(null);

      await expect(service.update('1', {}, '1')).rejects.toThrow(NotFoundException);
    });

    it('should update user successfully', async () => {
      const updateData = { name: 'Updated' };
      const updatedUser = { id: '1', ...updateData };
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateData, '1');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.delete('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should delete user successfully', async () => {
      mockUsersRepository.findById.mockResolvedValue({ id: '1' });
      mockUsersRepository.delete.mockResolvedValue(true);

      const result = await service.delete('1', '1');
      expect(result).toEqual({ message: 'Usuario eliminado con éxito' });
    });

    describe('getAll', () => {
      it('should return all users for a tenant', async () => {
        const mockUsers = [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ];
        mockUsersRepository.getAll.mockResolvedValue(mockUsers);

        const result = await service.getAll('tenant1');

        expect(mockUsersRepository.getAll).toHaveBeenCalledWith('tenant1');
        expect(result).toEqual(mockUsers);
      });
    });
  });
});
