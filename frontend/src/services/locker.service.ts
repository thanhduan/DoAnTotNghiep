import api from './api.service';
import { LockerEntity, LockerPayload } from '../types/locker.type';

export const lockerService = {
  getAll: async (params?: Record<string, any>): Promise<LockerEntity[]> => {
    const res = await api.get('/lockers', {
      params: {
        campusId: params?.campusId !== 'all' ? params?.campusId : undefined, // Skip 'all'
        status: params?.status,
        isActive: params?.isActive,
        search: params?.search,
      },
    });

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  getAllWithIoT: async (): Promise<LockerEntity[]> => {
    const res = await api.get('/lockers/iot');

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    console.warn('[LockerService] Unexpected response format:', res);
    return [];
  },

  findAllWithIoT: async (params?: Record<string, any>): Promise<LockerEntity[]> => {
    const res = await api.get('/lockers/iot', {
      params: {
        campusId: params?.campusId,
        status: params?.status,
        isActive: params?.isActive,
        search: params?.search,
      },
    });

    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    console.warn('[LockerService] Unexpected response format:', res);
    return [];
  },

  create: async (data: LockerPayload): Promise<LockerEntity> => {
    const { lastConnection, ...payload } = data;

    // 🔥 res CHÍNH LÀ locker
    const locker = await api.post('/lockers', payload);

    if (!locker || !locker.id) {
      throw new Error('API did not return valid locker');
    }

    return locker;
  },

  update: async (id: string, data: LockerPayload): Promise<LockerEntity> => {
    const { lastConnection, ...payload } = data;

    const locker = await api.put(`/lockers/${id}`, payload);

    if (!locker || !locker.id) {
      throw new Error('API did not return valid locker');
    }

    return locker;
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    return await api.delete(`/lockers/${id}`);
  },

  getIoTStatus: async (lockerId: string): Promise<any> => {
    const res = await api.get(`/lockers/${lockerId}/iot-status`);
    return res;
  },
};
