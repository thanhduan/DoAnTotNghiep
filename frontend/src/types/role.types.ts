import { Permission } from './auth.types';

// Re-export Permission for convenience
export type { Permission };

export interface Role {
  id: string;
  roleName: string;
  description?: string;
  isActive: boolean;
  permissionCount?: number;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDto {
  roleName: string;
  description?: string;
  permissionIds: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  roleName?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface PermissionListResponse {
  success: boolean;
  data: Permission[];
}
