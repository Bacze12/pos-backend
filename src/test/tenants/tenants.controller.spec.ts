import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../../modules/tenants/tenants.controller';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { CreateTenantDto } from '../../modules/tenants/dto/create-tenants.dto';
import { UpdateTenantPasswordDto } from '../../modules/tenants/dto/update-tenants.dto';

describe('TenantsController', () => {
  let controller: TenantsController;
  let _service: TenantsService;

  const mockTenantsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    _service = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenants', () => {
    it('should return all tenants', async () => {
      const result = ['tenant1', 'tenant2'];
      mockTenantsService.findAll.mockResolvedValue(result);

      expect(await controller.getTenants('testTenantId')).toBe(result);
      expect(mockTenantsService.findAll).toHaveBeenCalledWith('testTenantId');
    });
  });

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        businessName: 'Test Business',
        email: 'test@test.com',
      };

      // Update the mock response to match the actual service response
      const expectedResult = {
        tenant: {
          _id: '1', // Changed from id to _id
          businessName: 'Test Business',
          email: 'test@test.com',
        },
        password: 'password123',
        message: 'Tenant padre creado exitosamente',
      };

      mockTenantsService.create.mockResolvedValue(expectedResult);

      const result = await controller.createTenant(createTenantDto);

      // Update the expectation to match the actual structure
      expect(result).toEqual({
        message: 'Tenant padre creado exitosamente',
        tenant: {
          _id: '1',
          businessName: 'Test Business',
          email: 'test@test.com',
        },
        password: 'password123',
      });
      expect(mockTenantsService.create).toHaveBeenCalledWith(createTenantDto);
    });

    it('should handle errors when creating tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        businessName: 'Test Business',
        email: 'test@test.com',
      };

      const error = new Error('Creation failed');
      mockTenantsService.create.mockRejectedValue(error);

      await expect(controller.createTenant(createTenantDto)).rejects.toThrow(error);
    });
  });

  describe('updateTenantPassword', () => {
    it('should update tenant password', async () => {
      const updatePasswordDto: UpdateTenantPasswordDto = {
        newPassword: 'newPassword123',
      };
      const tenantId = 'testTenantId';

      mockTenantsService.updatePassword.mockResolvedValue({ success: true });

      await controller.updateTenantPassword(tenantId, updatePasswordDto);

      expect(mockTenantsService.updatePassword).toHaveBeenCalledWith(
        tenantId,
        updatePasswordDto.newPassword,
      );
    });
  });
});
