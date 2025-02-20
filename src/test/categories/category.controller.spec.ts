import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../../modules/category/category.controller';
import { CategoryService } from '../../modules/category/category.service';
import { BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from '../../modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../modules/category/dto/update-category.dto';

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
    it('should return an array of categories', async () => {
      const result = ['category1', 'category2'];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      expect(await controller.findAll('tenant1')).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = { name: 'Test Category' };
      const result = { id: '1', ...createDto };

      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      expect(await controller.create('tenant1', createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith('tenant1', createDto);
    });

    it('should throw BadRequestException if tenantId is not provided', async () => {
      const createDto: CreateCategoryDto = { name: 'Test Category' };

      await expect(controller.create('', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated Category' };
      const result = { id: '1', ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(result as any);

      expect(await controller.update('tenant1', '1', updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('tenant1', '1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const result = { id: '1', name: 'Deleted Category' };
      jest.spyOn(service, 'remove').mockResolvedValue(result as any);

      expect(await controller.remove('tenant1', '1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('1', 'tenant1');
    });
  });
});
