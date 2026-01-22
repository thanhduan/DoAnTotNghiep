/**
 * UserRole là string, lấy từ database roles collection
 * Sử dụng constants từ src/constants/roles.ts
 */
export type UserRole = string;

export interface CreateUserDto {
  email: string;
  fullName: string;
  role: UserRole;
  employeeId?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  campusId?: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: UserRole;
  employeeId?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  campusId?: string;
  isActive?: boolean;
}

export interface FilterUserDto {
  role?: UserRole;
  campusId?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin?: number;
    training_staff?: number;
    lecturer?: number;
    student?: number;
  };
}
