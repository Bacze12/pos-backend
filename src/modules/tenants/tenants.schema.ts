import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true, unique: true })
  businessName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // La contraseña debe ser almacenada de forma segura (hashed)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Object], default: [] })
  activeSession: {
    token: string;
    createdAt: Date;
    lastUsed: Date;
    deviceInfo: string;
  }[];

  @Prop({ default: 3 })
  maxActiveSessions: number;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
