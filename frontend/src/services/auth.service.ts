import apiService from './api.service';
import { User, Campus } from '../types/auth.types';
import { STORAGE_KEYS } from '../constants';

class AuthService {
  async getAllCampuses(): Promise<Campus[]> {
    return apiService.get('/campus');
  }

  loginWithGoogle(campusId: string): void {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    window.location.href = `${apiUrl}/auth/google/login?campusId=${campusId}`;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
  }

  async checkAuth(): Promise<boolean> {
    try {
      const result = await apiService.get<{ isAuthenticated: boolean }>('/auth/check');
      return result.isAuthenticated;
    } catch {
      return false;
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
