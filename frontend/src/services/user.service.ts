import api from './api.service';
import { UserListItem } from '../types/models.types';
import {
  CreateUserDto,
  UpdateUserDto,
  FilterUserDto,
  UserStatistics,
} from '../types/user.types';

export const userService = {
  /**
   * Get all users with filters
   */
  getAll: async (filters?: FilterUserDto): Promise<UserListItem[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.campusId) params.append('campusId', filters.campusId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<{ success: boolean; data: UserListItem[] }>(
      `/users?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserListItem> => {
    const response = await api.get<{ success: boolean; data: UserListItem }>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: CreateUserDto): Promise<UserListItem> => {
    const response = await api.post<{ success: boolean; data: UserListItem; message: string }>(
      '/users',
      data
    );
    return response.data;
  },

  /**
   * Update user
   */
  update: async (id: string, data: UpdateUserDto): Promise<UserListItem> => {
    const response = await api.put<{ success: boolean; data: UserListItem; message: string }>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete user (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  },

  /**
   * Activate user
   */
  activate: async (id: string): Promise<UserListItem> => {
    const response = await api.put<{ success: boolean; data: UserListItem; message: string }>(
      `/users/${id}/activate`
    );
    return response.data;
  },

  /**
   * Get user statistics
   */
  getStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get<{ success: boolean; data: UserStatistics }>(
      '/users/statistics'
    );
    return response.data;
  },
};
