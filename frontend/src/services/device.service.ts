import apiService from './api.service';
import { CreateDeviceDto, Device, UpdateDeviceDto } from '../types/device.types';

class DeviceService {
  private readonly BASE_PATH = '/devices';

  async getAll(params?: {
    roomId?: string;
    deviceStatus?: string;
    isActive?: boolean;
  }): Promise<Device[]> {
    const res = await apiService.get<Device[] | { data: Device[]; success?: boolean }>(
      this.BASE_PATH,
      { params },
    );

    if (Array.isArray(res)) {
      return res;
    }

    if (res && Array.isArray((res as any).data)) {
      return (res as any).data;
    }

    return [];
  }

  async getById(id: string): Promise<Device> {
    return await apiService.get<Device>(`${this.BASE_PATH}/${id}`);
  }

  async create(data: CreateDeviceDto): Promise<Device> {
    return await apiService.post<Device>(this.BASE_PATH, data);
  }

  async update(id: string, data: UpdateDeviceDto): Promise<Device> {
    return await apiService.put<Device>(`${this.BASE_PATH}/${id}`, data);
  }

  async remove(id: string): Promise<{ message: string } | { success: boolean }> {
    return await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new DeviceService();
