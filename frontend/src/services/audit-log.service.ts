import apiService from './api.service';

export const auditLogService = {
  getContent: async (): Promise<string> => {
    const response = await apiService.get<{ success: boolean; data: string }>('/audit-logs');
    return response.data;
  },

  download: async (): Promise<Blob> => {
    const response = await apiService.get<Blob>('/audit-logs/download', {
      responseType: 'blob',
    });
    return response as Blob;
  },
};

export default auditLogService;
