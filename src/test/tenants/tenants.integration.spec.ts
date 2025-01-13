import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../../modules/tenants/tenants.controller';
import { TenantsService } from '../../modules/tenants/tenants.service';

describe('TenantsController (Integration)', () => {
  let controller: TenantsController;
  let service: TenantsService;

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
    service = module.get<TenantsService>(TenantsService);
  });

  it('debería devolver todos los tenants', async () => {
    const mockTenants = [
      { businessName: 'Tenant1', email: 'tenant1@test.com' },
    ];
    mockService.findAll.mockResolvedValue(mockTenants);

    const result = await controller.getTenants();

    expect(result).toEqual(mockTenants);
  });
});
