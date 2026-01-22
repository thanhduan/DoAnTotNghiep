import { useAuth } from '../context/AuthContext';

/**
 * Hook to check permissions
 * Usage:
 *   const { hasPermission, hasAnyPermission, canAccessResource } = usePermission();
 *   if (hasPermission('users.create')) { ... }
 */
export const usePermission = () => {
  const { 
    permissions, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canAccessResource 
  } = useAuth();

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
  };
};

export default usePermission;
