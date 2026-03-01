import api from './api.service';
import { TimeSlot } from '../types/time-slot.types';

export interface TimeSlotQueryParams {
  slotType?: 'OLDSLOT' | 'NEWSLOT';
  isActive?: boolean;
}

export const timeSlotService = {
  /**
   * Get all time slots
   */
  getAll: async (params?: TimeSlotQueryParams): Promise<TimeSlot[]> => {
    const queryParams = new URLSearchParams();
    if (params?.slotType) queryParams.append('slotType', params.slotType);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

    const res = await api.get<{ success: boolean; data: TimeSlot[]; total?: number }>(
      `/time-slots?${queryParams.toString()}`
    );

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    if (Array.isArray(res)) {
      return res;
    }

    console.warn('[TimeSlotService] Unexpected response format:', res);
    return [];
  },
};
