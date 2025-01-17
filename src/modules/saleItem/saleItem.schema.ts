import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class SaleItem extends Document {
  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, required: true })
  tenantId: string; // Identificador del inquilino

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sale', required: true })
  sale: Types.ObjectId;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);
