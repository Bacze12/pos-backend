import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { RolesGuard } from '../../../src/common/guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserBuilder } from '../builders/users.builder';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAllByTenant: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRolesGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      // Simula un usuario ADMIN por defecto
      request.user = { tenantId: 'mockTenantId', role: 'ADMIN' };
      return true;
    },
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
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true }) // Simula la autenticación
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard) // Simula los roles
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('debería retornar todos los usuarios del tenant', async () => {
      const mockUsers = [
        new UserBuilder()
          .setName('User1')
          .setEmail('user1@test.com')
          .setTenantId('mockTenantId')
          .build(),
        new UserBuilder()
          .setName('User2')
          .setEmail('user2@test.com')
          .setTenantId('mockTenantId')
          .build(),
      ];
      mockUsersService.findAllByTenant.mockResolvedValue(mockUsers);

      const result = await controller.getUsers({
        user: { tenantId: 'mockTenantId' },
      });

      expect(service.findAllByTenant).toHaveBeenCalledWith('mockTenantId');
      expect(result).toEqual(mockUsers);
    });

    it('debería lanzar un error si falta tenantId', async () => {
      await expect(controller.getUsers({ user: {} })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar un error si el servicio falla', async () => {
      mockUsersService.findAllByTenant.mockRejectedValue(
        new Error('Error interno del servidor'),
      );

      await expect(
        controller.getUsers({ user: { tenantId: 'mockTenantId' } }),
      ).rejects.toThrow('Error interno del servidor');
    });
  });

  describe('getUserById', () => {
    it('debería retornar un usuario por ID', async () => {
      const mockUser = new UserBuilder()
        .setName('User1')
        .setEmail('user1@test.com')
        .setTenantId('mockTenantId')
        .build();
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(
        { user: { tenantId: 'mockTenantId' } },
        '1',
      );

      expect(service.findById).toHaveBeenCalledWith('1', 'mockTenantId');
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar un error si no encuentra un usuario por ID', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        controller.getUserById(
          { user: { tenantId: 'mockTenantId' } },
          'invalidId',
        ),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('createUser', () => {
    it('debería crear un usuario', async () => {
      const mockUser = new UserBuilder()
        .setName('User1')
        .setEmail('user1@test.com')
        .setPassword('password123')
        .setTenantId('mockTenantId')
        .build();
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.createUser(
        { user: { tenantId: 'mockTenantId' } },
        { name: 'User1', email: 'user1@test.com', password: 'password123' },
      );

      expect(service.create).toHaveBeenCalledWith({
        name: 'User1',
        email: 'user1@test.com',
        password: 'password123',
        tenantId: 'mockTenantId',
      });
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar un error si los datos del usuario son inválidos', async () => {
      const invalidUserDto = { name: '', email: 'not-an-email', password: '' };

      await expect(
        controller.createUser(
          { user: { tenantId: 'mockTenantId' } },
          invalidUserDto,
        ),
      ).rejects.toThrow('Datos inválidos para el usuario');
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario', async () => {
      const mockUpdatedUser = new UserBuilder()
        .setName('Updated User')
        .setTenantId('mockTenantId')
        .build();
      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser(
        { user: { tenantId: 'mockTenantId' } },
        '1',
        { name: 'Updated User' },
      );

      expect(service.update).toHaveBeenCalledWith(
        '1',
        { name: 'Updated User' },
        'mockTenantId',
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('debería lanzar un error si no se encuentra el usuario para actualizar', async () => {
      mockUsersService.update.mockResolvedValue(null);

      await expect(
        controller.updateUser(
          { user: { tenantId: 'mockTenantId' } },
          'invalidId',
          { name: 'Nonexistent User' },
        ),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario', async () => {
      const mockResponse = { message: 'Usuario eliminado con éxito' };
      mockUsersService.delete.mockResolvedValue(mockResponse);

      const result = await controller.deleteUser(
        { user: { tenantId: 'mockTenantId' } },
        '1',
      );

      expect(service.delete).toHaveBeenCalledWith('1', 'mockTenantId');
      expect(result).toEqual(mockResponse);
    });

    it('debería lanzar un error si no se encuentra el usuario para eliminar', async () => {
      mockUsersService.delete.mockResolvedValue(null);

      await expect(
        controller.deleteUser(
          { user: { tenantId: 'mockTenantId' } },
          'invalidId',
        ),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });
});
