import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../category.schema';

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

  async findAll(tenantId: string): Promise<Category[]> {
    return this.categoryModel.find({ tenantId }).exec();
  }

  async findById(tenantId: string, categoriesId: string): Promise<Category> {
    return this.categoryModel.findOne({ _id: categoriesId, tenantId, isActive: true }).exec();
  }

  async create(tenantId: string, categoryData: Partial<Category>): Promise<Category> {
    const category = new this.categoryModel({
      ...categoryData,
      tenantId,
    });
    return category.save();
  }

  async update(
    tenantId: string,
    categoriesId: string,
    updateData: Partial<Category>,
  ): Promise<Category> {
    return this.categoryModel
      .findOneAndUpdate({ _id: categoriesId, tenantId }, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(tenantId: string, categoriesId: string): Promise<boolean> {
    const result = await this.categoryModel.deleteOne({ _id: categoriesId, tenantId }).exec();
    return result.deletedCount > 0;
  }
}
