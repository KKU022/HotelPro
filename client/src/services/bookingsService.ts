import { apiRequest } from './api';
import type { Booking } from './types';

export interface CreateBookingData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  targetCurrency?: string;
}

export const bookingsService = {
  checkAvailability: async (roomId: string, checkIn: string, checkOut: string): Promise<{ isAvailable: boolean; nightlyRate: number }> => {
    return apiRequest<{ isAvailable: boolean; nightlyRate: number }>(
      `/bookings/check-availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
  },

  createBooking: async (data: CreateBookingData): Promise<{ message: string; booking: Booking }> => {
    return apiRequest<{ message: string; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyBookings: async (): Promise<{ count: number; bookings: Booking[] }> => {
    return apiRequest<{ count: number; bookings: Booking[] }>('/bookings/my-bookings');
  },

  getBookingById: async (id: string): Promise<{ booking: Booking }> => {
    return apiRequest<{ booking: Booking }>(`/bookings/${id}`);
  },

  cancelBooking: async (id: string): Promise<{ message: string; booking: Booking }> => {
    return apiRequest<{ message: string; booking: Booking }>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};
