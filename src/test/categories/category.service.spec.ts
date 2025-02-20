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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [{ id: '1', name: 'Category 1' }];
      mockCategoryRepository.findAll.mockResolvedValue(result);

      expect(await service.findAll('tenant1')).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a category', async () => {
      const result = { id: '1', name: 'Category 1' };
      mockCategoryRepository.findById.mockResolvedValue(result);

      expect(await service.findById('1', 'tenant1')).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = { name: 'New Category' };
      const result = { id: '1', ...createDto };
      mockCategoryRepository.create.mockResolvedValue(result);

      expect(await service.create('tenant1', createDto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Updated Category' };
      const result = { id: '1', ...updateDto };
      mockCategoryRepository.update.mockResolvedValue(result);

      expect(await service.update('tenant1', '1', updateDto)).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.update.mockResolvedValue(null);

      await expect(service.update('tenant1', '1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const result = { id: '1', name: 'Deleted Category' };
      mockCategoryRepository.softDelete.mockResolvedValue(result);

      expect(await service.remove('1', 'tenant1')).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.softDelete.mockResolvedValue(null);

      await expect(service.remove('1', 'tenant1')).rejects.toThrow(NotFoundException);
    });
  });
});
