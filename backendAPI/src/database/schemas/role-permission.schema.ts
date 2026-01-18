import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'role_permissions',
})
export class RolePermission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Permission', required: true })
  permissionId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);

// Indexes
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });
RolePermissionSchema.index({ roleId: 1 });
RolePermissionSchema.index({ permissionId: 1 });
