import { Permission } from '../types/auth.types';

/**
 * Permission utility functions
 */

export const checkPermission = (
  permissionName: string,
  permissions: Permission[]
): boolean => {
  return permissions.some(p => p.permissionName === permissionName);
};

export const checkAnyPermission = (
  permissionNames: string[],
  permissions: Permission[]
): boolean => {
  return permissionNames.some(name => checkPermission(name, permissions));
};

export const checkAllPermissions = (
  permissionNames: string[],
  permissions: Permission[]
): boolean => {
  return permissionNames.every(name => checkPermission(name, permissions));
};

export const checkResourceAccess = (
  resource: string,
  action: string,
  permissions: Permission[]
): boolean => {
  return permissions.some(p => p.resource === resource && p.action === action);
};

/**
 * Common permission sets for easy checking
 */
export const PERMISSIONS = {
  // Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Roles
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_MANAGE: 'roles.manage',
  
  // Campus
  CAMPUS_READ: 'campus.read',
  CAMPUS_MANAGE: 'campus.manage',
  
  // Rooms
  ROOMS_READ: 'rooms.read',
  ROOMS_CREATE: 'rooms.create',
  ROOMS_UPDATE: 'rooms.update',
  ROOMS_DELETE: 'rooms.delete',
  
  // Schedules
  SCHEDULES_READ: 'schedules.read',
  SCHEDULES_CREATE: 'schedules.create',
  SCHEDULES_UPDATE: 'schedules.update',
  SCHEDULES_DELETE: 'schedules.delete',
  
  // Bookings
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_APPROVE: 'bookings.approve',
  BOOKINGS_REJECT: 'bookings.reject',
  BOOKINGS_DELETE: 'bookings.delete',
  
  // Attendance
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_UPDATE: 'attendance.update',
  
  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
} as const;

/**
 * Check if user has admin permissions (all permissions)
 */
export const isAdmin = (permissions: Permission[]): boolean => {
  // Admin typically has all permissions or specific admin permission
  return permissions.length >= 20; // Admin should have most/all permissions
};

/**
 * Get permission display name
 */
export const getPermissionDisplayName = (permissionName: string): string => {
  const names: Record<string, string> = {
    'users.read': 'Xem người dùng',
    'users.create': 'Tạo người dùng',
    'users.update': 'Cập nhật người dùng',
    'users.delete': 'Xóa người dùng',
    'roles.read': 'Xem vai trò',
    'roles.create': 'Tạo vai trò',
    'roles.update': 'Cập nhật vai trò',
    'roles.delete': 'Xóa vai trò',
    'roles.manage': 'Quản lý vai trò',
    'campus.read': 'Xem cơ sở',
    'campus.manage': 'Quản lý cơ sở',
    'rooms.read': 'Xem phòng học',
    'rooms.create': 'Tạo phòng học',
    'rooms.update': 'Cập nhật phòng học',
    'rooms.delete': 'Xóa phòng học',
    'schedules.read': 'Xem lịch học',
    'schedules.create': 'Tạo lịch học',
    'schedules.update': 'Cập nhật lịch học',
    'schedules.delete': 'Xóa lịch học',
    'bookings.read': 'Xem đặt phòng',
    'bookings.create': 'Tạo đặt phòng',
    'bookings.approve': 'Duyệt đặt phòng',
    'bookings.reject': 'Từ chối đặt phòng',
    'bookings.delete': 'Xóa đặt phòng',
    'attendance.read': 'Xem điểm danh',
    'attendance.mark': 'Điểm danh',
    'attendance.update': 'Cập nhật điểm danh',
    'settings.read': 'Xem cài đặt',
    'settings.update': 'Cập nhật cài đặt',
    'reports.view': 'Xem báo cáo',
    'reports.export': 'Xuất báo cáo',
  };
  return names[permissionName] || permissionName;
};
