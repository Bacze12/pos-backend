import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: ['ADMIN', 'CASHIER', 'MANAGER'], default: 'CASHIER' })
  role: string;

  @Prop({ default: [] })
  sales: string[];

  @Prop({ default: [] })
  shifts: string[];

  @Prop({ type: [Object], default: [] })
  activeSession: {
    token: string;
    createdAt: Date;
    lastUsed: Date;
    deviceInfo: string;
  }[];

  @Prop({ default: 3 })
  maxActiveSessions: number;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

const schema = SchemaFactory.createForClass(User);

// Índice único compuesto para email y tenantId
schema.index({ email: 1, tenantId: 1 }, { unique: true });

export const UserSchema = schema;
