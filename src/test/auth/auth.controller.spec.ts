import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        businessName: 'test',
        email: 'test@test.com',
        password: 'password',
      };
      const expectedResult = { token: 'token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.businessName,
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = {
        businessName: 'test',
        email: 'test@test.com',
        password: 'wrong',
      };
      mockAuthService.login.mockRejectedValue(new Error());

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = {
        user: {
          tenantId: '123',
          role: 'ADMIN',
        },
      };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req);
      expect(result).toEqual({ message: 'Cierre de sesión exitoso' });
      expect(authService.logout).toHaveBeenCalledWith('123', true);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'validRefreshToken';
      const expectedResult = { token: 'newToken' };
      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshToken);
      expect(result).toEqual(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw BadRequestException when refresh token is not provided', async () => {
      await expect(controller.refreshToken('')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalidToken';
      mockAuthService.refreshToken.mockRejectedValue(new Error());

      await expect(controller.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});
