import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../../modules/tenants/tenants.controller';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { TenantBuilder } from '../builders/tenant.builder';
import { BadRequestException } from '@nestjs/common';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: TenantsService;

  const mockTenantsService = {
    findAll: jest.fn(),
    create: jest.fn(),
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
    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenants', () => {
    it('debería devolver todos los tenants', async () => {
      const mockTenants = [
        new TenantBuilder()
          .setBusinessName('Tenant1')
          .setEmail('tenant1@test.com')
          .setPassword('password1')
          .build(),
        new TenantBuilder()
          .setBusinessName('Tenant2')
          .setEmail('tenant2@test.com')
          .setPassword('password2')
          .build(),
      ];
      mockTenantsService.findAll.mockResolvedValue(mockTenants);

      const result = await controller.getTenants();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTenants);
    });

    it('debería lanzar un error si el servicio falla', async () => {
      mockTenantsService.findAll.mockRejectedValue(new Error('Error interno del servidor'));

      await expect(controller.getTenants()).rejects.toThrow('Error interno del servidor');
    });
  });

  describe('createTenant', () => {
    const validTenantData = {
      businessName: 'Tenant1',
      email: 'tenant1@test.com',
    };

    it('debería crear un tenant exitosamente', async () => {
      const mockResponse = {
        message: 'Tenant creado exitosamente',
        tenant: validTenantData,
        password: 'securePassword',
      };
      mockTenantsService.create.mockResolvedValue(mockResponse);

      const result = await controller.createTenant(validTenantData);

      expect(service.create).toHaveBeenCalledWith(validTenantData);
      expect(result).toEqual(mockResponse);
    });

    it('debería lanzar un error si el tenant ya existe', async () => {
      mockTenantsService.create.mockRejectedValue(new BadRequestException('El tenant ya existe'));

      await expect(controller.createTenant(validTenantData)).rejects.toThrow('El tenant ya existe');
    });

    it('debería lanzar un error si los datos son inválidos', async () => {
      const invalidTenantData = { businessName: '', email: '' };

      mockTenantsService.create.mockRejectedValue(
        new BadRequestException('Datos inválidos para el tenant'),
      );

      await expect(controller.createTenant(invalidTenantData)).rejects.toThrow(
        'Datos inválidos para el tenant',
      );
    });
  });
});
