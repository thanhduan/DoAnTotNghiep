import { Permission } from './auth.types';

// Re-export Permission for convenience
export type { Permission };

export interface Role {
  id?: string;
  _id?: string;
  roleName: string;
  roleCode?: string;
  roleLevel?: number;
  scope?: 'GLOBAL' | 'CAMPUS' | 'SELF';
  campusId?: string | null;
  description?: string;
  isActive: boolean;
  canAccessWeb?: boolean; // Can this role access web application
  canManageRoles?: boolean;
  permissionCount?: number;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDto {
  roleName: string;
  roleCode: string;
  roleLevel: number;
  scope?: 'GLOBAL' | 'CAMPUS' | 'SELF';
  campusId?: string | null;
  description?: string;
  permissionIds: string[];
  isActive?: boolean;
  canManageRoles?: boolean;
  canAccessWeb?: boolean; // Default: false (mobile only)
}

export interface UpdateRoleDto {
  roleName?: string;
  roleCode?: string;
  roleLevel?: number;
  scope?: 'GLOBAL' | 'CAMPUS' | 'SELF';
  campusId?: string | null;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
  canManageRoles?: boolean;
  canAccessWeb?: boolean;
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
