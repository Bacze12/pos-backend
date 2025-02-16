import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/inventory.dto';
import { Inventory, InventoryMovementType } from './inventory.schema';

describe('InventoryController', () => {
  let controller: InventoryController;

  // Use string IDs to satisfy the CreateInventoryDto types
  const mockInventoryItem: Inventory = {
    productId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439013',
    type: InventoryMovementType.IN,
    quantity: 10,
    date: new Date(),
    notes: 'Test notes',
    // Add _id and __v in a type-safe way by casting as any
    _id: '507f1f77bcf86cd799439011',
    __v: 0,
  } as any; // using "as any" to include extra properties

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  describe('create', () => {
    it('should create an inventory item', async () => {
      const createDto: CreateInventoryDto = {
        productId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439013',
        type: InventoryMovementType.IN,
        quantity: 10,
        notes: 'Test notes',
      };

      jest.spyOn(controller['inventoryService'], 'create').mockResolvedValue(mockInventoryItem);

      const result = await controller.create(createDto);
      expect(result).toBe(mockInventoryItem);
      expect(controller['inventoryService'].create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return array of inventory items', async () => {
      const mockItems = [
        { ...mockInventoryItem, _id: '507f1f77bcf86cd799439014' },
        { ...mockInventoryItem, _id: '507f1f77bcf86cd799439015' },
      ];
      // Cast the array to Inventory[] using "as any" if needed
      jest
        .spyOn(controller['inventoryService'], 'findAll')
        .mockResolvedValue(mockItems as Inventory[]);

      const result = await controller.findAll();
      expect(result).toBe(mockItems);
      expect(controller['inventoryService'].findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return single inventory item', async () => {
      jest.spyOn(controller['inventoryService'], 'findById').mockResolvedValue(mockInventoryItem);

      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toBe(mockInventoryItem);
      expect(controller['inventoryService'].findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
