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

  const MOCK_TENANT_ID = 'mockTenantId';

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
    service = mockTenantsService as unknown as TenantsService; // Cast the mock to TenantsService type
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      // Usar el mockTenantsService directamente para las expectativas
      mockTenantsService.findAll.mockResolvedValue(mockTenants);

      const result = await controller.getTenants(MOCK_TENANT_ID);

      expect(mockTenantsService.findAll).toHaveBeenCalledWith(MOCK_TENANT_ID); // Usar mockTenantsService en lugar de service
      expect(mockTenantsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTenants);
    });

    it('debería lanzar un error si el servicio falla', async () => {
      mockTenantsService.findAll.mockRejectedValue(new Error('Error interno del servidor'));

      // Cambio aquí: agregar tenantId como parámetro
      await expect(controller.getTenants(MOCK_TENANT_ID)).rejects.toThrow(
        'Error interno del servidor',
      );
    });
  });

  describe('createTenant', () => {
    const validTenantData = {
      businessName: 'Tenant1',
      email: 'tenant1@test.com',
    };

    it('debería crear un tenant exitosamente', async () => {
      const mockResponse = {
        message: 'Tenant padre creado exitosamente', // Usar el mensaje correcto
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
