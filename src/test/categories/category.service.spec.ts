import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../modules/category/category.service';
import { CategoryRepository } from '../../modules/category/repositories/category.repository';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let _repository: CategoryRepository;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [{ id: '1', name: 'Test' }];
      mockCategoryRepository.findAll.mockResolvedValue(mockCategories);

      expect(await service.findAll('tenant1')).toBe(mockCategories);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('findById', () => {
    it('should return a category if found', async () => {
      const mockCategory = { id: '1', name: 'Test' };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      expect(await service.findById('1', 'tenant1')).toBe(mockCategory);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('1', 'tenant1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      const createCategoryDto = { name: 'Test Category' };
      const mockCategory = { id: '1', ...createCategoryDto };
      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      expect(await service.create('tenant1', createCategoryDto)).toBe(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith('tenant1', createCategoryDto);
    });
  });

  describe('update', () => {
    it('should update and return a category if found', async () => {
      const updateCategoryDto = { name: 'Updated Category' };
      const mockCategory = { id: '1', ...updateCategoryDto };
      mockCategoryRepository.update.mockResolvedValue(mockCategory);

      expect(await service.update('1', updateCategoryDto, 'tenant1')).toBe(mockCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('1', updateCategoryDto, 'tenant1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.update.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Test' }, 'tenant1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return a category if found', async () => {
      const mockCategory = { id: '1', name: 'Test' };
      mockCategoryRepository.softDelete.mockResolvedValue(mockCategory);

      expect(await service.remove('1', 'tenant1')).toBe(mockCategory);
      expect(mockCategoryRepository.softDelete).toHaveBeenCalledWith('1', 'tenant1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.softDelete.mockResolvedValue(null);

      await expect(service.remove('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });
});
