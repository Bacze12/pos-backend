import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../modules/category/category.service';
import { CategoryRepository } from '../../modules/category/repositories/category.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../../modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../modules/category/dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: CategoryRepository;

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
    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = ['test'];
      jest.spyOn(repository, 'findAll').mockResolvedValue(result as any);
      expect(await service.findAll('tenant-1')).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a category', async () => {
      const result = { id: '1', name: 'test' };
      jest.spyOn(repository, 'findById').mockResolvedValue(result as any);
      expect(await service.findById('1', 'tenant-1')).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.findById('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = { name: 'test' };
      const result = { id: '1', name: 'test', tenantId: 'tenant-1' };
      jest.spyOn(repository, 'create').mockResolvedValue(result as any);
      expect(await service.create(createDto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = { name: 'updated' };
      const result = { id: '1', ...updateDto };
      jest.spyOn(repository, 'update').mockResolvedValue(result as any);
      expect(await service.update('1', updateDto, 'tenant-1')).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);
      await expect(service.update('1', { name: 'test' }, 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const result = { id: '1', name: 'test' };
      jest.spyOn(repository, 'softDelete').mockResolvedValue(result as any);
      expect(await service.remove('1', 'tenant-1')).toBe(result);
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(repository, 'softDelete').mockResolvedValue(null);
      await expect(service.remove('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
