import api from './api.service';
import { LockerEntity, LockerPayload } from '../types/locker.type';

export const lockerService = {
  getAll: async (): Promise<LockerEntity[]> => {
    const res = await api.get('/lockers');

    // vì interceptor → res chính là data
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }

    if (Array.isArray(res)) {
      return res;
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
};
