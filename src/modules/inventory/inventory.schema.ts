import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ enum: InventoryMovementType, default: InventoryMovementType.IN })
  type: InventoryMovementType;

  @Prop({ default: Date.now })
  date: Date;

  @Prop()
  notes?: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
