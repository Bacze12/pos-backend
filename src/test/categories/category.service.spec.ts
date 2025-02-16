import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../modules/category/category.service';
import { CategoryRepository } from '../../modules/category/repositories/category.repository';
import { NotFoundException } from '@nestjs/common';
import { Category } from '../../modules/category/category.schema';
import { CreateCategoryDto } from '../../modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../modules/category/dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let _repository: CategoryRepository;

  const mockCategory: Category = {
    _id: '1',
    name: 'Test Category',
    description: 'Test Description',
    tenantId: 'tenant1',
    isActive: true, // Changed from isDeleted to isActive
    __v: 0,
    // Add required Mongoose Document methods
    $assertPopulated: jest.fn(),
    $clearModifiedPaths: jest.fn(),
    $clone: jest.fn(),
  } as unknown as Category;

  const mockCategoryRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    _repository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([mockCategory]);
      const result = await service.findAll('tenant1');
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findById', () => {
    it('should return a category', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      const result = await service.findById('1', 'tenant1');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);
      await expect(service.findById('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'New Category',
        description: 'New Description',
        tenantId: 'tenant1',
        isActive: false,
      };
      mockCategoryRepository.create.mockResolvedValue({ ...mockCategory, ...createDto });
      const result = await service.create(createDto);
      expect(result).toEqual({ ...mockCategory, ...createDto });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category',
      };
      mockCategoryRepository.update.mockResolvedValue({ ...mockCategory, ...updateDto });
      const result = await service.update('1', updateDto, 'tenant1');
      expect(result).toEqual({ ...mockCategory, ...updateDto });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.update.mockResolvedValue(null);
      await expect(service.update('1', { name: 'Test' }, 'tenant1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoryRepository.softDelete.mockResolvedValue(mockCategory);
      const result = await service.remove('1', 'tenant1');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.softDelete.mockResolvedValue(null);
      await expect(service.remove('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });
});
