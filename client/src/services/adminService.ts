import { apiRequest } from './api';
import type { AdminMetrics, Booking, Room } from './types';

export const adminService = {
  getMetrics: async (): Promise<{ metrics: AdminMetrics }> => {
    return apiRequest<{ metrics: AdminMetrics }>('/admin/metrics');
  },

  getRooms: async (): Promise<{ count: number; rooms: Room[] }> => {
    return apiRequest<{ count: number; rooms: Room[] }>('/admin/rooms');
  },

  createRoom: async (roomData: Partial<Room>): Promise<{ message: string; room: Room }> => {
    return apiRequest<{ message: string; room: Room }>('/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  updateRoom: async (id: string, roomData: Partial<Room>): Promise<{ message: string; room: Room }> => {
    return apiRequest<{ message: string; room: Room }>(`/admin/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  toggleRoomStatus: async (id: string): Promise<{ message: string; room: Room }> => {
    return apiRequest<{ message: string; room: Room }>(`/admin/rooms/${id}/status`, {
      method: 'PATCH',
    });
  },

  getBookings: async (status?: string, search?: string): Promise<{ count: number; bookings: Booking[] }> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{ count: number; bookings: Booking[] }>(`/admin/bookings${query}`);
  },

  updateBookingStatus: async (id: string, status: 'confirmed' | 'cancelled'): Promise<{ message: string; booking: Booking }> => {
    return apiRequest<{ message: string; booking: Booking }>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
