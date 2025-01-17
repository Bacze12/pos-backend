import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop({ type: String, required: true })
  tenantId: string; // Identificador del inquilino

  @Prop({ type: Number, required: true })
  total: number; // Total de la venta

  @Prop({ type: Number, default: 0 })
  extraTaxTotal?: number; // Impuesto adicional (opcional)

  @Prop({ type: Number, default: 0 })
  ivaAmount?: number; // Monto del IVA (opcional)

  @Prop({ type: String, enum: ['CASH', 'CARD', 'OTHER'], default: 'CASH' })
  paymentMethod: string; // Método de pago

  @Prop({ type: Number, default: 0 })
  subtotal?: number; // Subtotal de la venta (opcional)

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId; // Usuario que realizó la venta

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SaleItem' }], default: [] })
  items: Types.ObjectId[]; // Detalle de la venta (lista de items)

  @Prop({ type: Types.ObjectId, ref: 'Shift', required: false })
  shift?: Types.ObjectId; // Turno en el que se realizó la venta
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
