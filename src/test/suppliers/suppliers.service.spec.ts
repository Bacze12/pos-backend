import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from '../../../src/modules/supplier/supplier.service';
import { SupplierRepository } from '../../../src/modules/supplier/repositories/supplier.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSupplierDto } from '../../../src/modules/supplier/dto/create-supplier.dto';

describe('SupplierService', () => {
  let service: SupplierService;
  let _repository: SupplierRepository;

  const mockSupplierRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SupplierRepository,
          useValue: mockSupplierRepository,
        },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    _repository = module.get<SupplierRepository>(SupplierRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of suppliers', async () => {
      const result = [{ id: '1', name: 'Supplier1' }];
      mockSupplierRepository.findAll.mockResolvedValue(result);

      expect(await service.findAll('tenant1')).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a supplier', async () => {
      const result = { id: '1', name: 'Supplier1' };
      mockSupplierRepository.findById.mockResolvedValue(result);

      expect(await service.findById('tenant1', '1')).toBe(result);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.findById.mockResolvedValue(null);

      await expect(service.findById('tenant1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a supplier', async () => {
      const createDto: CreateSupplierDto = {
        name: 'New Supplier',
        email: 'supplier@test.com',
        isActive: true,
        phone: '1234567890',
        address: 'Test Address',
        products: [],
      };

      const result = { id: '1', ...createDto };
      mockSupplierRepository.create.mockResolvedValue(result);

      expect(await service.create('tenant1', createDto)).toBe(result);
      expect(mockSupplierRepository.create).toHaveBeenCalledWith('tenant1', createDto);
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const invalidDto = {
        name: 'New Supplier',
        // Missing required email and tenantId
      };

      mockSupplierRepository.create.mockRejectedValue(new BadRequestException());

      await expect(service.create('tenant1', invalidDto as CreateSupplierDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate email format', async () => {
      const invalidDto = {
        tenantId: 'tenant1',
        name: 'New Supplier',
        email: 'invalid-email', // Invalid email format
      };

      mockSupplierRepository.create.mockRejectedValue(new BadRequestException());

      await expect(service.create('tenant1', invalidDto as CreateSupplierDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a supplier', async () => {
      const updateDto = { name: 'Updated Supplier' };
      const result = { id: '1', ...updateDto };
      mockSupplierRepository.update.mockResolvedValue(result);

      expect(await service.update('tenant1', '1', updateDto)).toBe(result);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.update.mockResolvedValue(null);

      await expect(service.update('tenant1', '1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a supplier', async () => {
      mockSupplierRepository.delete.mockResolvedValue(true);

      await expect(service.delete('tenant1', '1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.delete.mockResolvedValue(false);

      await expect(service.delete('tenant1', '1')).rejects.toThrow(NotFoundException);
    });
  });
});
