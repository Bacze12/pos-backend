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
    it('should return array of categories', async () => {
      const result = ['test'];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      expect(await controller.findAll('tenant-1')).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const result = { id: '1', ...createCategoryDto };

      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      expect(await controller.create('tenant-1', createCategoryDto)).toBe(result);
    });

    it('should throw BadRequestException if tenantId is not provided', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };

      await expect(controller.create('', createCategoryDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const result = { id: '1', ...updateCategoryDto };

      jest.spyOn(service, 'update').mockResolvedValue(result as any);

      expect(await controller.update('tenant-1', '1', updateCategoryDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('1', updateCategoryDto, 'tenant-1');
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const result = { id: '1', name: 'Deleted Category' };
      jest.spyOn(service, 'remove').mockResolvedValue(result as any);

      expect(await controller.remove('tenant-1', '1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('1', 'tenant-1');
    });
  });
});
