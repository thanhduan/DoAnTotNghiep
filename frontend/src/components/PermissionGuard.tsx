import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_CODES } from '../constants/roles';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string[]; // Any of these permissions
  allPermissions?: string[]; // All of these permissions
  resource?: string;
  action?: string;
  fallback?: React.ReactNode; // What to show if no permission
  hideIfNoPermission?: boolean; // If true, return null instead of fallback
  bypassAdmin?: boolean; // If true, SUPER_ADMIN role bypasses all permission checks (default: true)
}

/**
 * Component to conditionally render children based on permissions
 * 
 * SUPER_ADMIN role bypasses all permission checks by default
 * 
 * Usage:
 * <PermissionGuard permissions={['users.create']}>
 *   <button>Create User</button>
 * </PermissionGuard>
 * 
 * <PermissionGuard resource="users" action="delete">
 *   <button>Delete User</button>
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  allPermissions,
  resource,
  action,
  fallback = null,
  hideIfNoPermission = true,
  bypassAdmin = true,
}) => {
  const { roleDetails, hasAnyPermission, hasAllPermissions, canAccessResource } = useAuth();

  // Bypass all checks for SUPER_ADMIN if bypassAdmin is true
  if (bypassAdmin && roleDetails?.roleCode === ROLE_CODES.SUPER_ADMIN) {
    return <>{children}</>;
  }

  let hasAccess = true;

  // Check any permission
  if (permissions && permissions.length > 0) {
    hasAccess = hasAnyPermission(permissions);
  }

  // Check all permissions
  if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAccess && hasAllPermissions(allPermissions);
  }

  // Check resource.action
  if (resource && action) {
    hasAccess = hasAccess && canAccessResource(resource, action);
  }

  if (!hasAccess) {
    if (hideIfNoPermission) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
