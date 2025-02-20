import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../category.schema';

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

  async findAll(tenantId: string): Promise<Category[]> {
    return this.categoryModel.find({ tenantId, isActive: true }).exec();
  }

  async findById(id: string, tenantId: string): Promise<Category> {
    return this.categoryModel.findOne({ _id: id, tenantId, isActive: true }).exec();
  }

  async create(tenantId: string, categoryData: Partial<Category>): Promise<Category> {
    const category = new this.categoryModel({ ...categoryData, tenantId });
    return category.save();
  }

  async update(
    categoriesId: string,
    tenantId: string,
    updateData: Partial<Category>,
  ): Promise<Category> {
    return this.categoryModel
      .findOneAndUpdate({ _id: categoriesId, tenantId }, { $set: updateData }, { new: true })
      .exec();
  }

  async softDelete(id: string, tenantId: string): Promise<Category> {
    return this.categoryModel
      .findOneAndUpdate(
        { _id: id, tenantId, isActive: true },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
  }
}
