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

  async findById(id: string, tenantId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id, tenantId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(createCategoryDto);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    tenantId: string,
  ): Promise<Category> {
    const updatedCategory = await this.categoryRepository.update(id, updateCategoryDto, tenantId);
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async remove(id: string, tenantId: string): Promise<Category> {
    const deletedCategory = await this.categoryRepository.softDelete(id, tenantId);
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return deletedCategory;
  }
}
