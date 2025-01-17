import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CashDrawer extends Document {
  @Prop({ required: true })
  tenantId: string; // Campo para identificar al inquilino

  @Prop({ required: false })
  reason: string; // Nombre de la caja

  @Prop({ required: true, default: 0 })
  amount: number; // Monto actual de la caja

  @Prop({ type: String, enum: ['CASH_IN', 'CASH_OUT', 'INITIAL_CASH', 'FINAL_CASH'] })
  type: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Shift' }] })
  shift: Types.ObjectId[];
}

export const CashDrawerSchema = SchemaFactory.createForClass(CashDrawer);
