import api from './api.service';
import {
  Booking,
  CreateBookingDto,
  QueryBookingParams,
  UpdateBookingDto,
} from '@/types/booking.types';

export const bookingService = {
  getAll: async (params?: QueryBookingParams): Promise<Booking[]> => {
    const query = new URLSearchParams();

    if (params?.roomId) query.append('roomId', params.roomId);
    if (params?.lecturerId) query.append('lecturerId', params.lecturerId);
    if (params?.lecturerSearch) query.append('lecturerSearch', params.lecturerSearch);
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);
    if (params?.status) query.append('status', params.status);

    const res = await api.get<{ success: boolean; data: Booking[] }>(
      `/bookings?${query.toString()}`,
    );

    return res.data || [];
  },

  getById: async (id: string): Promise<Booking> => {
    const res = await api.get<{ success: boolean; data: Booking }>(`/bookings/${id}`);
    return res.data;
  },

  create: async (payload: CreateBookingDto): Promise<Booking> => {
    const res = await api.post<{ success: boolean; data: Booking }>('/bookings', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateBookingDto): Promise<Booking> => {
    const res = await api.patch<{ success: boolean; data: Booking }>(`/bookings/${id}`, payload);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
};

export default bookingService;
