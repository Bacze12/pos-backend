import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './category.schema';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(tenantId: string): Promise<Category[]> {
    return this.categoryRepository.findAll(tenantId);
  }

  async findById(tenantId: string, categoriesId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(tenantId, categoriesId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoriesId} not found`);
    }
    return category;
  }

  async create(tenantId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(tenantId, createCategoryDto);
  }

  async update(
    tenantId: string,
    categoriesId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryRepository.update(
      tenantId,
      categoriesId,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${categoriesId} not found`);
    }
    return updatedCategory;
  }

  async delete(tenantId: string, categoriesId: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(tenantId, categoriesId);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${categoriesId} not found`);
    }
  }
}
