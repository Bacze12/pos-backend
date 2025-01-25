import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { UnauthorizedException } from '@nestjs/common';
import { hashPassword } from '../../middleware/crypto.middleware';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
  };
  const mockUsersService = {
    findByEmailAndTenant: jest.fn(),
    updateUser: jest.fn(),
  };
  const mockTenantsService = {
    findByBusinessName: jest.fn(),
    findByBusinessNameAndEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: TenantsService, useValue: mockTenantsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debería retornar un token JWT para credenciales correctas', async () => {
      const hashedPassword = hashPassword('password123');

      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue({
        _id: 'mockTenantId',
        email: 'test@test.com',
        businessName: 'Test Business',
        password: hashedPassword,
        isActive: true,
      });

      mockJwtService.sign.mockReturnValue('mockToken');

      const result = await service.login('Test Business', 'test@test.com', 'password123');

      expect(mockTenantsService.findByBusinessNameAndEmail).toHaveBeenCalledWith(
        'Test Business',
        'test@test.com',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        tenantId: 'mockTenantId',
        businessName: 'Test Business',
        email: 'test@test.com',
        role: 'ADMIN',
      });
      expect(result).toEqual({ access_token: 'mockToken' });
    });

    it('debería retornar un token JWT para credenciales correctas con findByBusinessName', async () => {
      const hashedPassword = hashPassword('password123');

      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue(null);
      mockTenantsService.findByBusinessName.mockResolvedValue({
        _id: 'mockTenantId',
        businessName: 'Test Business',
        isActive: true,
      });

      mockUsersService.findByEmailAndTenant.mockResolvedValue({
        _id: 'mockUserId',
        tenantId: 'mockTenantId',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        activeSession: [],
        maxActiveSessions: 3,
        name: 'Test User', // Añadir name si es necesario
      });

      // Mockear tokens con llamadas separadas
      mockJwtService.sign
        .mockReturnValueOnce('accessToken') // Primera llamada (access token)
        .mockReturnValueOnce('refreshToken'); // Segunda llamada (refresh token)

      const result = await service.login('Test Business', 'test@test.com', 'password123');

      // Verificar llamadas a sign con los payloads correctos
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        {
          tenantId: 'mockTenantId',
          username: 'Test User',
          email: 'test@test.com',
          role: 'USER',
        },
        { expiresIn: '15m' },
      );

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        {
          sub: 'mockUserId',
          tenantId: 'mockTenantId',
        },
        { expiresIn: '7d' },
      );

      // Verificar el resultado
      expect(result).toEqual({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      });
    });

    it('debería lanzar UnauthorizedException para credenciales incorrectas', async () => {
      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue(null);
      mockTenantsService.findByBusinessName.mockResolvedValue(null);

      await expect(
        service.login('Test Business', 'test@test.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
