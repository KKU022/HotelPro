import { Schema, model, Document } from 'mongoose';

export type RoomCategory = 'Chalet' | 'Suite' | 'Villa' | 'Cabin';

export interface IHotspotMeta {
  heroFeatured: boolean;
  pinPosition: {
    x: number; // Percentage 0 - 100
    y: number; // Percentage 0 - 100
  };
}

export interface IRoom extends Document {
  title: string;
  slug: string;
  tagline: string;
  category: RoomCategory;
  pricePerNight: number;
  maxGuests: number;
  coverImage: string;
  gallery: string[];
  amenities: string[];
  hotspotMeta: IHotspotMeta;
  isActive: boolean;
  country: string;
  countryCode: string;
  city: string;
  state?: string;
  timezone: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const hotspotMetaSchema = new Schema<IHotspotMeta>(
  {
    heroFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinPosition: {
      x: { type: Number, required: true, min: 0, max: 100 },
      y: { type: Number, required: true, min: 0, max: 100 },
    },
  },
  { _id: false }
);

const roomSchema = new Schema<IRoom>(
  {
    title: {
      type: String,
      required: [true, 'Room title is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, 'Room slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    tagline: {
      type: String,
      required: [true, 'Room tagline is required'],
      trim: true,
      maxlength: 250,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Chalet', 'Suite', 'Villa', 'Cabin'],
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price per night must be at least 1'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guest capacity is required'],
      min: [1, 'Max guests must be at least 1'],
      max: [20, 'Max guests cannot exceed 20'],
      index: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    hotspotMeta: {
      type: hotspotMetaSchema,
      required: true,
      default: () => ({
        heroFeatured: false,
        pinPosition: { x: 50, y: 50 },
      }),
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country name is required'],
      default: 'India',
      trim: true,
      index: true,
    },
    countryCode: {
      type: String,
      required: [true, 'ISO Country code is required'],
      default: 'IN',
      uppercase: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
      default: 'Indore',
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Madhya Pradesh',
      trim: true,
    },
    timezone: {
      type: String,
      required: [true, 'IANA timezone identifier is required'],
      default: 'Asia/Kolkata',
      trim: true,
    },
    currency: {
      type: String,
      required: [true, 'Base currency code is required'],
      default: 'INR',
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

// Discovery and filtering composite indexes
roomSchema.index({ isActive: 1, category: 1, pricePerNight: 1 });
roomSchema.index({ isActive: 1, maxGuests: 1 });
roomSchema.index({ isActive: 1, countryCode: 1, city: 1 });
roomSchema.index({ isActive: 1, city: 1 });
roomSchema.index({ isActive: 1, country: 1 });

export const Room = model<IRoom>('Room', roomSchema);
