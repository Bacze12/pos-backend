import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Shift extends Document {
  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId; // Usuario que creó el turno

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  users: Types.ObjectId[]; // Usuarios asignados a este turno

  @Prop({ enum: ['OPEN', 'CLOSED', 'CANCELLED'], default: 'OPEN' })
  status: string;

  @Prop({ required: true })
  initialCash: number;

  @Prop()
  finalCash: number;

  @Prop()
  notes: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Sale' }] })
  sales: Types.ObjectId[];
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
