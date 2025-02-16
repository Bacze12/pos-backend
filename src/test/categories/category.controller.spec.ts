import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../../modules/category/category.controller';
import { CategoryService } from '../../modules/category/category.service';
import { BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from '../../modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../modules/category/dto/update-category.dto';
import { Category } from '../../modules/category/category.schema';
import { Document } from 'mongoose';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoryService;

  // Updated mock document type
  type MockDocument = Document<unknown, object, Category> &
    Category &
    Required<{ _id: unknown }> & { __v: number };

  const mockMongooseDoc = {
    _id: '1',
    __v: 0,
    $assertPopulated: jest.fn(),
    $clearModifiedPaths: jest.fn(),
    $clone: jest.fn(),
  };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories for a tenant', async () => {
      const tenantId = 'tenant123';
      const mockCategories = [
        {
          ...mockMongooseDoc,
          name: 'Category 1',
          description: 'Description 1',
          tenantId,
          isActive: true,
        },
      ] as unknown as MockDocument[];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockCategories);

      expect(await controller.findAll(tenantId)).toBe(mockCategories);
      expect(service.findAll).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const tenantId = 'tenant123';
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
        description: '',
        tenantId: '',
        isActive: false,
      };

      const mockCreatedCategory = {
        ...mockMongooseDoc,
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        tenantId,
        isActive: createCategoryDto.isActive,
      } as unknown as MockDocument;

      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedCategory);

      expect(await controller.create(tenantId, createCategoryDto)).toBe(mockCreatedCategory);
      expect(service.create).toHaveBeenCalledWith({ ...createCategoryDto, tenantId });
    });

    it('should throw BadRequestException if tenantId is missing', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
        description: '',
        tenantId: '',
        isActive: false,
      };

      await expect(controller.create('', createCategoryDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const tenantId = 'tenant123';
      const id = 'cat123';
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const mockUpdatedCategory = {
        ...mockMongooseDoc,
        name: updateCategoryDto.name,
        tenantId,
      } as unknown as MockDocument;

      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedCategory);

      expect(await controller.update(tenantId, id, updateCategoryDto)).toBe(mockUpdatedCategory);
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto, tenantId);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const tenantId = 'tenant123';
      const id = 'cat123';
      const mockDeletedCategory = {
        ...mockMongooseDoc,
        name: 'Deleted Category',
        tenantId,
        deleted: true,
      } as unknown as MockDocument;

      jest.spyOn(service, 'remove').mockResolvedValue(mockDeletedCategory);

      expect(await controller.remove(tenantId, id)).toBe(mockDeletedCategory);
      expect(service.remove).toHaveBeenCalledWith(id, tenantId);
    });
  });
});
