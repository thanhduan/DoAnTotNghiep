export type UserRole = 'admin' | 'security' | 'lecturer' | 'education_officer';

export interface Campus {
  _id: string;
  campusCode: string;
  campusName: string;
  address: string;
  isActive: boolean;
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
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
}

export interface LoginResponse {
  user: User;
  token: string;
}
