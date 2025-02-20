import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../../modules/category/category.controller';
import { CategoryService } from '../../modules/category/category.service';
import { CreateCategoryDto } from '../../modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../modules/category/dto/update-category.dto';
import { BadRequestException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoryService;

  const mockCategoryService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories for a tenant', async () => {
      const categories = [{ id: '1', name: 'Test Category' }];
      mockCategoryService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll('tenant-1');
      expect(result).toEqual(categories);
      expect(service.findAll).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = { name: 'New Category' };
      const created = { id: '1', ...createDto };
      mockCategoryService.create.mockResolvedValue(created);

      const result = await controller.create('tenant-1', createDto);
      expect(result).toEqual(created);
      expect(service.create).toHaveBeenCalledWith('tenant-1', createDto);
    });

    it('should throw BadRequestException if tenantId is not provided', async () => {
      const createDto: CreateCategoryDto = { name: 'New Category' };

      await expect(controller.create('', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated Category' };
      const updated = { id: '1', ...updateDto };
      mockCategoryService.update.mockResolvedValue(updated);

      const result = await controller.update('tenant-1', '1', updateDto);
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto, 'tenant-1');
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const deleted = { id: '1', name: 'Deleted Category' };
      mockCategoryService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('tenant-1', '1');
      expect(result).toEqual(deleted);
      expect(service.remove).toHaveBeenCalledWith('1', 'tenant-1');
    });
  });
});
