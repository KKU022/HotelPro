import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { convertCurrency } from '../config/exchangeRates';

const roomPayloadSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  slug: z.string().trim().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  tagline: z.string().trim().min(10, 'Tagline must be at least 10 characters'),
  category: z.enum(['Chalet', 'Suite', 'Villa', 'Cabin']),
  pricePerNight: z.number().min(1, 'Price per night must be at least 1'),
  maxGuests: z.number().int().min(1).max(20),
  coverImage: z.string().url('Cover image must be a valid URL'),
  gallery: z.array(z.string().url()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  country: z.string().trim().default('India'),
  countryCode: z.string().trim().toUpperCase().default('IN'),
  city: z.string().trim().default('Indore'),
  state: z.string().trim().optional().default('Madhya Pradesh'),
  timezone: z.string().trim().default('Asia/Kolkata'),
  currency: z.string().trim().toUpperCase().default('INR'),
  hotspotMeta: z.object({
    heroFeatured: z.boolean().default(false),
    pinPosition: z.object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    }),
  }).optional().default({
    heroFeatured: false,
    pinPosition: { x: 50, y: 50 },
  }),
  isActive: z.boolean().optional().default(true),
});

/**
 * Get real-data hotel operational metrics normalized to INR
 */
export const getAdminMetrics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Aggregate confirmed bookings and convert to INR base safely
    const confirmedBookingsList = await Booking.find({ status: 'confirmed' }).select('totalPrice currency');
    let totalRevenueInr = 0;
    confirmedBookingsList.forEach((b) => {
      const inrValue = convertCurrency(b.totalPrice, b.currency || 'INR', 'INR');
      totalRevenueInr += inrValue;
    });

    // Calculate active occupancy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStaysCount = await Booking.countDocuments({
      status: 'confirmed',
      checkIn: { $lte: today },
      checkOut: { $gte: today },
    });

    const occupancyRate = activeRooms > 0 ? Math.round((activeStaysCount / activeRooms) * 100) : 0;

    res.status(200).json({
      metrics: {
        totalRooms,
        activeRooms,
        totalCustomers,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: Math.round(totalRevenueInr),
        currency: 'INR',
        occupancyRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rooms (both active and inactive) with destination filters for admin inventory control
 */
export const getAdminRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { countryCode, city } = req.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (countryCode && countryCode !== 'all') {
      filter.countryCode = (countryCode as string).toUpperCase();
    }
    if (city && city !== 'all') {
      filter.city = new RegExp(`^${(city as string).trim()}$`, 'i');
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new room record
 */
export const createAdminRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = roomPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const existingSlug = await Room.findOne({ slug: parseResult.data.slug });
    if (existingSlug) {
      res.status(400).json({ message: `A room with slug '${parseResult.data.slug}' already exists.` });
      return;
    }

    const room = await Room.create(parseResult.data);
    res.status(201).json({ message: 'Room created successfully.', room });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing room record
 */
export const updateAdminRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const parseResult = roomPayloadSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const room = await Room.findByIdAndUpdate(id, parseResult.data, { new: true, runValidators: true });
    if (!room) {
      res.status(404).json({ message: 'Room not found.' });
      return;
    }

    res.status(200).json({ message: 'Room updated successfully.', room });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle room active state (soft activation/deactivation)
 */
export const toggleRoomStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ message: 'Room not found.' });
      return;
    }

    room.isActive = !room.isActive;
    await room.save();

    res.status(200).json({
      message: `Room status updated to ${room.isActive ? 'active' : 'inactive'}.`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings with filtering for admin table
 */
export const getAdminBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('room', 'title slug category pricePerNight currency country city')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // In-memory filter for search if user query provided
    let filteredBookings = bookings;
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      filteredBookings = bookings.filter((b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = b.user as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = b.room as any;
        return (
          u?.name?.toLowerCase().includes(q) ||
          u?.email?.toLowerCase().includes(q) ||
          r?.title?.toLowerCase().includes(q) ||
          r?.city?.toLowerCase().includes(q) ||
          b._id.toString().includes(q)
        );
      });
    }

    res.status(200).json({
      count: filteredBookings.length,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reservation status (e.g. cancel or confirm)
 */
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      res.status(400).json({ message: 'Status must be either confirmed or cancelled.' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.paymentStatus = 'refunded_mock';
    }
    await booking.save();

    res.status(200).json({ message: `Reservation status updated to ${status}.`, booking });
  } catch (error) {
    next(error);
  }
};
