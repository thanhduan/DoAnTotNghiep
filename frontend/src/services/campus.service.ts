import api from './api.service';
import { Campus } from '../types/models.types';

export const campusService = {
  /**
   * Get all campuses
   */
  getAll: async (): Promise<Campus[]> => {
    const response = await api.get<Campus[]>('/campus');
    return response;
  },

  /**
   * Get active campuses only
   */
  getActive: async (): Promise<Campus[]> => {
    const response = await api.get<Campus[]>('/campus?isActive=true');
    return response;
  },

  /**
   * Get campus by ID
   */
  getById: async (id: string): Promise<Campus> => {
    const response = await api.get<Campus>(`/campus/${id}`);
    return response;
  },
};
