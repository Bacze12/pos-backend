import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../../modules/tenants/tenants.controller';
import { TenantsService } from '../../modules/tenants/tenants.service';

describe('TenantsController (Integration)', () => {
  let controller: TenantsController;

  const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  it('debería devolver todos los tenants', async () => {
    const mockTenants = [{ businessName: 'Tenant1', email: 'tenant1@test.com' }];
    mockService.findAll.mockResolvedValue(mockTenants);

    // Cambio clave: Proveer el tenantId requerido
    const result = await controller.getTenants('mockTenantId');

    expect(result).toEqual(mockTenants);
  });
});
