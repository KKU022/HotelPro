import { apiRequest } from './api';
import type { Room, DestinationTaxonomy } from './types';

export interface RoomFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  search?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
}

export const roomsService = {
  getAllRooms: async (params: RoomFilterParams = {}): Promise<{ count: number; rooms: Room[] }> => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.country && params.country !== 'all') searchParams.set('country', params.country);
    if (params.countryCode && params.countryCode !== 'all') searchParams.set('countryCode', params.countryCode);
    if (params.city && params.city !== 'all') searchParams.set('city', params.city);
    if (params.state && params.state !== 'all') searchParams.set('state', params.state);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.guests) searchParams.set('guests', params.guests.toString());
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<{ count: number; rooms: Room[] }>(`/rooms${query}`);
  },

  getFeaturedRooms: async (): Promise<{ count: number; rooms: Room[] }> => {
    return apiRequest<{ count: number; rooms: Room[] }>('/rooms/featured');
  },

  getRoomBySlug: async (slug: string): Promise<{ room: Room }> => {
    return apiRequest<{ room: Room }>(`/rooms/${slug}`);
  },

  getDestinations: async (): Promise<{ destinations: DestinationTaxonomy[] }> => {
    return apiRequest<{ destinations: DestinationTaxonomy[] }>('/rooms/destinations');
  },
};
