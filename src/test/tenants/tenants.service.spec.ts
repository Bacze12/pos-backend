import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { TenantsRepository } from '../../modules/tenants/repositories/tenants.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Tenant } from '../../modules/tenants/tenants.schema';
import * as crypto from '../../middleware/crypto.middleware';

jest.mock('../../middleware/crypto.middleware');

describe('TenantsService', () => {
  let service: TenantsService;
  let _repository: TenantsRepository;

  const mockRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: TenantsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    _repository = module.get<TenantsRepository>(TenantsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return tenant when found', async () => {
      const mockTenant = { id: '1', businessName: 'test' };
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne({ id: '1' });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne({ id: '1' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const mockTenantData = {
      businessName: 'test',
      email: 'test@test.com',
    };

    it('should create tenant successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const mockPassword = 'password123';
      const mockHashedPassword = 'hashedPassword123';

      (crypto.generateRandomPassword as jest.Mock).mockReturnValue(mockPassword);
      (crypto.hashPassword as jest.Mock).mockReturnValue(mockHashedPassword);

      const mockSavedTenant = {
        _id: '1',
        ...mockTenantData,
        password: mockHashedPassword,
        isActive: true,
        activeSession: [],
        maxActiveSessions: 3,
      };

      mockRepository.create.mockResolvedValue(mockSavedTenant);

      const result = await service.create(mockTenantData);

      expect(result).toEqual({
        message: 'Tenant creado exitosamente',
        tenant: {
          _id: '1',
          businessName: mockTenantData.businessName,
          email: mockTenantData.email,
        },
        password: mockPassword,
      });
    });

    it('should throw ConflictException if tenant already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ _id: '1' });

      await expect(service.create(mockTenantData)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if tenant already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ _id: '1' });

      await expect(service.create(mockTenantData)).rejects.toThrow(ConflictException);
      await expect(service.create(mockTenantData)).rejects.toThrow('El tenant ya existe');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockTenant = { id: '1' } as Tenant;
      const newPassword = 'newPassword';
      const hashedPassword = 'hashedNewPassword';

      mockRepository.findById.mockResolvedValue(mockTenant);
      (crypto.hashPassword as jest.Mock).mockReturnValue(hashedPassword);
      mockRepository.updatePassword.mockResolvedValue({ ...mockTenant, password: hashedPassword });

      const result = await service.updatePassword('1', newPassword);
      expect(result).toBeDefined();
      expect(crypto.hashPassword).toHaveBeenCalledWith(newPassword);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updatePassword('1', 'newPassword')).rejects.toThrow(NotFoundException);
    });
  });
});
