import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../modules/users/users.controller';
import { UsersService } from '../../modules/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../modules/users/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let _service: UsersService;

  const mockUsersService = {
    findAllByTenant: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    active: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    _service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return array of users', async () => {
      const result = [{ id: 1, name: 'Test' }];
      mockUsersService.findAllByTenant.mockResolvedValue(result);

      expect(await controller.getUsers('tenant-1')).toBe(result);
      expect(mockUsersService.findAllByTenant).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('getUserById', () => {
    it('should return a user', async () => {
      const result = { id: 1, name: 'Test' };
      mockUsersService.findById.mockResolvedValue(result);

      expect(await controller.getUserById('tenant-1', '1')).toBe(result);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.getUserById('tenant-1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: '123456',
        tenantId: 'tenant-1',
        role: 'user',
        name: '',
      };
      const result = { id: 1, ...createUserDto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.createUser('tenant-1', createUserDto)).toBe(result);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated' };
      const result = { id: 1, name: 'Updated' };
      mockUsersService.update.mockResolvedValue(result);

      expect(await controller.updateUser('tenant-1', '1', updateUserDto)).toBe(result);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.update.mockResolvedValue(null);

      await expect(controller.updateUser('tenant-1', '1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = { id: 1, name: 'Test' };
      mockUsersService.delete.mockResolvedValue(result);

      expect(await controller.deleteUser('tenant-1', '1')).toBe(result);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.delete.mockResolvedValue(null);

      await expect(controller.deleteUser('tenant-1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const result = { id: 1, isActive: true };
      mockUsersService.active.mockResolvedValue(result);

      expect(await controller.updateUserStatus('tenant-1', '1', true)).toBe(result);
      expect(mockUsersService.active).toHaveBeenCalledWith('1', 'tenant-1', true);
    });
  });
});
