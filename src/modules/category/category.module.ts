import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './category.controller';
import { CategorySchema } from './category.schema';
import { CategoryService } from './category.service';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoriesModule {}
