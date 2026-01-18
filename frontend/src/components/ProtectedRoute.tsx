import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { getDefaultDashboard } from '../constants/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[]; // Any of these permissions
  requiredAllPermissions?: string[]; // All of these permissions
  requireResource?: { resource: string; action: string }; // Specific resource.action
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredPermissions,
  requiredAllPermissions,
  requireResource,
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user,
    roleDetails,
    hasAnyPermission, 
    hasAllPermissions, 
    canAccessResource 
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Priority: Permission-based access first (new approach)
  // Then fallback to role-based (legacy support)
  
  // Check permission-based access first
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
    // User has permission, allow access regardless of role
    return <>{children}</>;
  }

  // Check if user has ALL required permissions
  if (requiredAllPermissions && requiredAllPermissions.length > 0) {
    if (!hasAllPermissions(requiredAllPermissions)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-4">Bạn không có đủ quyền để truy cập trang này.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Check resource.action access
  if (requireResource) {
    const { resource, action } = requireResource;
    if (!canAccessResource(resource, action)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền <strong>{action}</strong> trên <strong>{resource}</strong>.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Legacy: Check role-based access (only if no permission check was specified)
  const userRoleName = roleDetails?.roleName || '';
  
  if (allowedRoles && allowedRoles.length > 0 && userRoleName) {
    // Normalize role names for comparison (case-insensitive, handle spaces/underscores)
    const normalizedUserRole = userRoleName.toLowerCase().replace(/\s+/g, '_');
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().replace(/\s+/g, '_'));
    
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      // Redirect to appropriate dashboard based on role
      const defaultRoute = getDefaultDashboard(userRoleName);
      return <Navigate to={defaultRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
