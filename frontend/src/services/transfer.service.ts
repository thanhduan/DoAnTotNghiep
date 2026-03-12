import api from './api.service';
import {
  CreateTransferDto,
  TransferRecord,
  TransferTargetOptionsResponse,
} from '../types/transfer.types';

const transferService = {
  create: async (payload: CreateTransferDto): Promise<TransferRecord> => {
    const res = await api.post<{ success: boolean; data: TransferRecord }>('/transfers', payload);
    return res.data;
  },

  cancel: async (id: string): Promise<TransferRecord> => {
    const res = await api.patch<{ success: boolean; data: TransferRecord }>(
      `/transfers/${id}/cancel`,
      {},
    );

    return res.data;
  },

  getSelfExistingBySourceSchedules: async (
    sourceScheduleIds: string[],
  ): Promise<Record<string, TransferRecord>> => {
    if (!sourceScheduleIds.length) {
      return {};
    }

    const res = await api.post<{ success: boolean; data: Record<string, TransferRecord> }>(
      '/transfers/self/existing-by-source-schedules',
      { sourceScheduleIds },
    );

    return res.data || {};
  },

  getSelfTargetOptions: async (fromScheduleId: string): Promise<TransferTargetOptionsResponse> => {
    const query = new URLSearchParams({ fromScheduleId }).toString();
    const res = await api.get<{ success: boolean; data: TransferTargetOptionsResponse }>(
      `/transfers/self/target-options?${query}`,
    );

    return res.data || { options: [] };
  },
};

export default transferService;
