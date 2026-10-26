import { Schema, model, Document, Types } from 'mongoose';

export type BookingStatus = 'confirmed' | 'cancelled';
export type PaymentStatus = 'paid_mock' | 'refunded_mock';

export interface IBooking extends Document {
  room: Types.ObjectId;
  user: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalNights: number;
  nightlyRate: number;
  totalPrice: number;
  currency: string;
  propertyTimezone: string;
  originalNightlyRate?: number;
  originalCurrency?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'At least 1 guest is required'],
    },
    totalNights: {
      type: Number,
      required: [true, 'Total nights count is required'],
      min: [1, 'Reservation must be for at least 1 night'],
    },
    nightlyRate: {
      type: Number,
      required: [true, 'Nightly rate is required'],
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
    currency: {
      type: String,
      required: [true, 'Currency code is required'],
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    propertyTimezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    originalNightlyRate: {
      type: Number,
    },
    originalCurrency: {
      type: String,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid_mock', 'refunded_mock'],
      default: 'paid_mock',
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

// High-performance overlap index: fast conflict detection for active reservations
bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });
// User history query index
bookingSchema.index({ user: 1, createdAt: -1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
