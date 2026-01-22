import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'permissions',
})
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  permissionName: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: true })
  action: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ permissionName: 1 });
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ isActive: 1 });
