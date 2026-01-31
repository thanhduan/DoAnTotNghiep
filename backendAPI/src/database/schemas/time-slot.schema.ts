import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'time_slots' })
export class TimeSlot extends Document {
  @Prop({ required: true, enum: ['OLDSLOT', 'NEWSLOT'] })
  slotType: string;

  @Prop({ required: true })
  slotNumber: number;

  @Prop({ required: true })
  slotName: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);

// Indexes
TimeSlotSchema.index({ slotType: 1, slotNumber: 1 });
