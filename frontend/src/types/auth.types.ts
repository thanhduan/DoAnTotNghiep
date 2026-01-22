/**
 * UserRole được lấy động từ database
 * Không nên hardcode, dùng roleDetails.roleName thay vì role string
 */
export type UserRole = string;

export interface Campus {
  _id: string;
  campusCode: string;
  campusName: string;
  address: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
}

export interface RoleDetails {
  id: string;
  roleName: string;
  roleCode: string;
  roleLevel: number;
  description: string;
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  roleId?: string;
  employeeId?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  googleId?: string;
  campusId: Campus;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roleDetails: RoleDetails | null;
  permissions: Permission[];
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
  roleDetails?: RoleDetails;
  permissions?: Permission[];
}
