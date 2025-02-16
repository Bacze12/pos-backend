import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './repository/inventory.repository';
import { InventoryMovementType } from './inventory.schema';

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: InventoryRepository;

  const mockInventoryRepository = {
    findProductById: jest.fn(),
    createInventoryDocument: jest.fn(),
    saveInventoryMovement: jest.fn(),
    updateProductStock: jest.fn(),
    findAllInventory: jest.fn(),
    findInventoryById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get<InventoryRepository>(InventoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockInventoryData = {
      productId: '123',
      quantity: 5,
      type: InventoryMovementType.IN,
      userId: 'user123',
    };

    it('should create inventory movement for IN type', async () => {
      const mockProduct = { id: '123', stock: 10 };
      const mockNewInventory = { ...mockInventoryData, id: 'inv123' };

      mockInventoryRepository.findProductById.mockResolvedValue(mockProduct);
      mockInventoryRepository.createInventoryDocument.mockReturnValue(mockNewInventory);

      const result = await service.create(mockInventoryData);

      expect(repository.findProductById).toHaveBeenCalledWith('123');
      expect(repository.createInventoryDocument).toHaveBeenCalledWith(mockInventoryData);
      expect(repository.saveInventoryMovement).toHaveBeenCalledWith(mockNewInventory);
      expect(repository.updateProductStock).toHaveBeenCalledWith('123', 15);
      expect(result).toEqual(mockNewInventory);
    });

    it('should throw error if product not found', async () => {
      mockInventoryRepository.findProductById.mockResolvedValue(null);

      await expect(service.create(mockInventoryData)).rejects.toThrow('Producto no encontrado');
    });

    it('should throw error if insufficient stock for OUT movement', async () => {
      const mockProduct = { id: '123', stock: 3 };
      mockInventoryRepository.findProductById.mockResolvedValue(mockProduct);

      await expect(
        service.create({ ...mockInventoryData, type: InventoryMovementType.OUT }),
      ).rejects.toThrow('Stock insuficiente para realizar la salida');
    });
  });

  describe('findAll', () => {
    it('should return all inventory movements', async () => {
      const mockInventories = [{ id: '1' }, { id: '2' }];
      mockInventoryRepository.findAllInventory.mockResolvedValue(mockInventories);

      const result = await service.findAll();
      expect(result).toEqual(mockInventories);
    });
  });

  describe('findById', () => {
    it('should return inventory movement by id', async () => {
      const mockInventory = { id: '1' };
      mockInventoryRepository.findInventoryById.mockResolvedValue(mockInventory);

      const result = await service.findById('1');
      expect(result).toEqual(mockInventory);
    });
  });
});
