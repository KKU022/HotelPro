export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface HotspotMeta {
  heroFeatured: boolean;
  pinPosition: {
    x: number;
    y: number;
  };
}

export interface Room {
  _id: string;
  title: string;
  slug: string;
  tagline: string;
  category: 'Chalet' | 'Suite' | 'Villa' | 'Cabin';
  pricePerNight: number;
  maxGuests: number;
  coverImage: string;
  gallery: string[];
  amenities: string[];
  hotspotMeta: HotspotMeta;
  isActive: boolean;
  country: string;
  countryCode: string;
  city: string;
  state?: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  room: Room;
  user: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalNights: number;
  nightlyRate: number;
  totalPrice: number;
  currency: string;
  propertyTimezone: string;
  originalNightlyRate?: number;
  originalCurrency?: string;
  status: 'confirmed' | 'cancelled';
  paymentStatus: 'paid_mock' | 'refunded_mock';
  createdAt: string;
  updatedAt: string;
}

export interface DestinationTaxonomy {
  country: string;
  countryCode: string;
  cities: string[];
}

export interface AdminMetrics {
  totalRooms: number;
  activeRooms: number;
  totalCustomers: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  currency: string;
  occupancyRate: number;
}
