import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true, index: true })
  deviceCode: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({
    required: true,
    enum: ['ok', 'broken'],
    default: 'ok',
    index: true,
  })
  deviceStatus: 'ok' | 'broken';

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
