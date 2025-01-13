import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Supplier extends Document {
  @Prop({ required: true })
  tenantId: string; // Campo para identificar al inquilino

  @Prop({ required: true })
  name: string; // Nombre del proveedor

  @Prop({ required: true, unique: true })
  email: string; // Correo electrónico único del proveedor

  @Prop()
  phone: string; // Teléfono del proveedor

  @Prop()
  address: string; // Dirección del proveedor

  @Prop({ default: true })
  isActive: boolean; // Estado activo/inactivo del proveedor

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: Types.ObjectId[]; // Relación con los productos asociados
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
