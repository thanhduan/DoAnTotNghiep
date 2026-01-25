import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'roles',
})
export class Role extends Document {
  @Prop({ required: true, unique: true })
  roleName: string;

  @Prop({ required: true, unique: true })
  roleCode: string; // e.g., 'SUPER_ADMIN', 'CAMPUS_ADMIN', 'TRAINING_OFFICER'

  @Prop({ required: true, min: 0, max: 4 })
  roleLevel: number; // 0=Super Admin, 1=Campus Admin, 2=Training Officer, 3=Lecturer/Security, 4=Student

  @Prop({ enum: ['GLOBAL', 'CAMPUS', 'SELF'], default: 'GLOBAL' })
  scope: string;

  @Prop({ type: Types.ObjectId, ref: 'Campus', default: null })
  campusId: Types.ObjectId | null;

  @Prop()
  description: string;

  @Prop({ default: false })
  canAccessWeb: boolean; // Can this role access web application (vs mobile only)

  @Prop({ default: false })
  canManageRoles: boolean; // Can this role manage roles

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes
RoleSchema.index({ roleName: 1 });
RoleSchema.index({ roleCode: 1 });
RoleSchema.index({ roleLevel: 1 });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ campusId: 1, scope: 1 });
