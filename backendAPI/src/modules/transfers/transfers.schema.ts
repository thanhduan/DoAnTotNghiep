import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transfer extends Document {
  @Prop()
  roomId: string;
  @Prop()
  lockerId: string;
  @Prop()
  fromUserId: string;
  @Prop()
  toUserId: string;
  @Prop()
  campusId: string;
  @Prop()
  fromScheduleId: string;
  @Prop()
  toScheduleId: string;
  @Prop()
  transferDate: Date;
  @Prop()
  reason: string;
  @Prop({ default: 'pending' })
  status: string;
  @Prop()
  approvedAt: Date;
  @Prop()
  completedAt: Date;
  @Prop()
  notes: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  cancelledAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);
