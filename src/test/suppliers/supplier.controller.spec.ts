import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from '../../modules/supplier/supplier.controller';
import { SupplierService } from '../../modules/supplier/supplier.service';
import { CreateSupplierDto } from 'src/modules/supplier/dto/create-supplier.dto';
import { BadRequestException } from '@nestjs/common';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SupplierService;

  const mockSupplierService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SupplierService,
          useValue: mockSupplierService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSuppliers', () => {
    it('should return all suppliers for a tenant', async () => {
      const tenantId = 'tenant-123';
      const suppliers = [{ id: '1', name: 'Supplier 1' }];
      mockSupplierService.findAll.mockResolvedValue(suppliers);

      const result = await controller.getSuppliers(tenantId);
      expect(result).toEqual(suppliers);
      expect(service.findAll).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('createSupplier', () => {
    it('should create a new supplier', async () => {
      const tenantId = 'tenant-123';
      const supplierData: CreateSupplierDto = {
        name: 'New Supplier',
        email: 'supplier@test.com',
        isActive: true,
        phone: '1234567890',
        address: 'Test Address',
        products: [],
        tenantId: tenantId,
      };
      const createdSupplier = { id: '1', ...supplierData };
      mockSupplierService.create.mockResolvedValue(createdSupplier);

      const result = await controller.createSupplier(tenantId, supplierData);
      expect(result).toEqual(createdSupplier);
      expect(service.create).toHaveBeenCalledWith(tenantId, supplierData);
    });

    it('should handle validation errors', async () => {
      const tenantId = 'tenant-123';
      const invalidData = { name: 'Test' };
      mockSupplierService.create.mockRejectedValue(new BadRequestException());

      await expect(
        controller.createSupplier(tenantId, invalidData as CreateSupplierDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier', async () => {
      const tenantId = 'tenant-123';
      const supplierId = 'supplier-123';
      const updateData = { name: 'Updated Supplier' };
      const updatedSupplier = { id: supplierId, ...updateData };
      mockSupplierService.update.mockResolvedValue(updatedSupplier);

      const result = await controller.updateSupplier(tenantId, supplierId, updateData);
      expect(result).toEqual(updatedSupplier);
      expect(service.update).toHaveBeenCalledWith(tenantId, supplierId, updateData);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier', async () => {
      const tenantId = 'tenant-123';
      const supplierId = 'supplier-123';
      mockSupplierService.delete.mockResolvedValue({ deleted: true });

      const result = await controller.deleteSupplier(tenantId, supplierId);
      expect(result).toEqual({ deleted: true });
      expect(service.delete).toHaveBeenCalledWith(tenantId, supplierId);
    });
  });
});
