import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'campus',
})
export class Campus extends Document {
  @Prop({ required: true, unique: true })
  campusCode: string;

  @Prop({ required: true })
  campusName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
