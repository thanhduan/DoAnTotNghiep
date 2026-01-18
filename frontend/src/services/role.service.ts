import apiService from './api.service';
import { Role, CreateRoleDto, UpdateRoleDto, Permission } from '../types/role.types';

class RoleService {
  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await apiService.get<{ success: boolean; data: Role[] }>('/roles');
    return response.data;
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await apiService.get<{ success: boolean; data: Role }>(`/roles/${id}`);
    return response.data;
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiService.get<{ success: boolean; data: Permission[] }>('/roles/permissions');
    return response.data;
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto): Promise<Role> {
    const response = await apiService.post<{ success: boolean; data: Role; message: string }>(
      '/roles',
      data
    );
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    const response = await apiService.patch<{ success: boolean; data: Role; message: string }>(
      `/roles/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await apiService.delete(`/roles/${id}`);
  }
}

export const roleService = new RoleService();
export default roleService;
