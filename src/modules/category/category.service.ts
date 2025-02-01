import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

  async findAll(tenantId: string) {
    return this.categoryModel.find({ tenantId });
  }

  async create(createCategoryDto: any) {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async update(id: string, updateCategoryDto: any, tenantId: string) {
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { ...updateCategoryDto, tenantId },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string, tenantId: string) {
    const category = await this.categoryModel.findByIdAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
