import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  categoryId: string;

  @Prop()
  deletedAt: Date;

  @Prop()
  extraTaxRate: number;

  @Prop()
  finalPrice: number;

  @Prop({ default: false })
  hasExtraTax: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isIvaExempt: boolean;

  @Prop()
  marginPercent: number;

  @Prop()
  minSellingPrice: number;

  @Prop()
  purchasePrice: number;

  @Prop()
  sellingPrice: number;

  @Prop()
  sku: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  supplierId: string;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true })
  tenantId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
