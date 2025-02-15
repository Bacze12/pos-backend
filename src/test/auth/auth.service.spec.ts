import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { UsersService } from '../../modules/users/users.service';
import * as crypto from '../../middleware/crypto.middleware';

jest.mock('../../middleware/crypto.middleware');

describe('AuthService', () => {
  let service: AuthService;
  let _jwtService: JwtService;
  let _tenantsService: TenantsService;
  let _usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockTenantsService = {
    findByBusinessNameAndEmail: jest.fn(),
    findByBusinessName: jest.fn(),
    findById: jest.fn(),
    updateTenant: jest.fn(),
  };

  const mockUsersService = {
    findByEmailAndTenant: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: TenantsService, useValue: mockTenantsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _jwtService = module.get<JwtService>(JwtService);
    _tenantsService = module.get<TenantsService>(TenantsService);
    _usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate tenant successfully', async () => {
      const mockTenant = {
        _id: '1',
        businessName: 'test',
        email: 'test@test.com',
        password: 'hashedPassword',
        isActive: true,
        activeSession: [],
      };

      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue(mockTenant);
      jest.spyOn(crypto, 'verifyPassword').mockReturnValue(true);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await service.login('test', 'test@test.com', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.role).toBe('ADMIN');
    });

    it('should throw UnauthorizedException for inactive tenant', async () => {
      const mockTenant = {
        isActive: false,
        businessName: 'test',
        email: 'test@test.com',
        password: 'hashedPassword',
      };

      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue(mockTenant);

      await expect(service.login('test', 'test@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should authenticate user successfully', async () => {
      const mockTenant = { _id: '1', businessName: 'test' };
      const mockUser = {
        _id: '2',
        name: 'User',
        email: 'user@test.com',
        password: 'hashedPassword',
        isActive: true,
        role: 'USER',
        tenantId: '1',
        activeSession: [],
      };

      mockTenantsService.findByBusinessNameAndEmail.mockResolvedValue(null);
      mockTenantsService.findByBusinessName.mockResolvedValue(mockTenant);
      mockUsersService.findByEmailAndTenant.mockResolvedValue(mockUser);
      jest.spyOn(crypto, 'verifyPassword').mockReturnValue(true);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await service.login('test', 'user@test.com', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.role).toBe('USER');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token for tenant successfully', async () => {
      const mockPayload = {
        sub: '1',
        type: 'tenant',
        tenantId: '1',
      };

      const mockTenant = {
        _id: '1',
        businessName: 'test',
        activeSession: [
          {
            token: 'oldToken',
            createdAt: new Date(),
            lastUsed: new Date(),
          },
        ],
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockTenantsService.findById.mockResolvedValue(mockTenant);
      mockJwtService.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');

      const result = await service.refreshToken('oldToken');

      expect(result).toHaveProperty('access_token', 'newAccessToken');
      expect(result).toHaveProperty('refresh_token', 'newRefreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refreshToken('invalidToken')).rejects.toThrow(UnauthorizedException);
    });
  });
});
