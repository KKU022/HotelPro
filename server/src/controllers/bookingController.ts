import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import { Room } from '../models/Room';
import { convertCurrency } from '../config/exchangeRates';

const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  guests: z.number().int().min(1, 'Guest count must be at least 1'),
  targetCurrency: z.string().optional(),
});

/**
 * Check if a room is available for a given date range
 */
export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      res.status(400).json({ message: 'roomId, checkIn, and checkOut query parameters are required.' });
      return;
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({ message: 'Invalid date formats provided.' });
      return;
    }

    if (checkOutDate <= checkInDate) {
      res.status(400).json({ message: 'Check-out date must be after check-in date.' });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      res.status(404).json({ message: 'Room not found or currently inactive.' });
      return;
    }

    // Check for overlapping confirmed reservations
    const conflictingBooking = await Booking.findOne({
      room: roomId,
      status: 'confirmed',
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    const isAvailable = !conflictingBooking;

    res.status(200).json({
      roomId,
      isAvailable,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nightlyRate: room.pricePerNight,
      currency: room.currency || 'INR',
      timezone: room.timezone || 'Asia/Kolkata',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new booking with currency snapshot and concurrency protection
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required to make a reservation.' });
      return;
    }

    const parseResult = createBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { roomId, checkIn, checkOut, guests, targetCurrency } = parseResult.data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Standardize dates to property midnight
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      res.status(400).json({ message: 'Check-in date cannot be in the past.' });
      return;
    }

    if (checkOutDate <= checkInDate) {
      res.status(400).json({ message: 'Check-out date must be strictly after check-in date.' });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      res.status(404).json({ message: 'Room not found or currently inactive.' });
      return;
    }

    if (guests > room.maxGuests) {
      res.status(400).json({
        message: `Selected room accommodates a maximum of ${room.maxGuests} guests. Requested: ${guests}.`,
      });
      return;
    }

    // Calculate nights server-side
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (totalNights < 1) {
      res.status(400).json({ message: 'Reservations must be for at least one night.' });
      return;
    }

    // Determine charge currency and rate
    const agreedCurrency = targetCurrency ? targetCurrency.toUpperCase() : (room.currency || 'INR');
    const agreedNightlyRate = convertCurrency(room.pricePerNight, room.currency || 'INR', agreedCurrency);
    const agreedTotalPrice = agreedNightlyRate * totalNights;

    // Concurrency handling: Attempt transaction (Atlas/ReplicaSet), fallback to isolated check
    let bookingCreated = null;

    try {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const conflict = await Booking.findOne({
          room: roomId,
          status: 'confirmed',
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        }).session(session);

        if (conflict) {
          await session.abortTransaction();
          session.endSession();
          res.status(409).json({
            message: 'This property is already reserved for the selected dates. Please select alternative dates.',
          });
          return;
        }

        const [newBooking] = await Booking.create(
          [
            {
              room: room._id,
              user: req.user.id,
              checkIn: checkInDate,
              checkOut: checkOutDate,
              guests,
              totalNights,
              nightlyRate: agreedNightlyRate,
              totalPrice: agreedTotalPrice,
              currency: agreedCurrency,
              propertyTimezone: room.timezone || 'Asia/Kolkata',
              originalNightlyRate: room.pricePerNight,
              originalCurrency: room.currency || 'INR',
              status: 'confirmed',
              paymentStatus: 'paid_mock',
            },
          ],
          { session }
        );

        await session.commitTransaction();
        session.endSession();
        bookingCreated = newBooking;
      } catch (txnError: any) {
        await session.abortTransaction();
        session.endSession();
        if (txnError?.message?.includes('Transaction numbers are only allowed') || txnError?.code === 20) {
          throw new Error('FALLBACK_STANDALONE');
        }
        throw txnError;
      }
    } catch (err: any) {
      if (err?.message === 'FALLBACK_STANDALONE') {
        const conflict = await Booking.findOne({
          room: roomId,
          status: 'confirmed',
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        });

        if (conflict) {
          res.status(409).json({
            message: 'This property is already reserved for the selected dates. Please select alternative dates.',
          });
          return;
        }

        bookingCreated = await Booking.create({
          room: room._id,
          user: req.user.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          totalNights,
          nightlyRate: agreedNightlyRate,
          totalPrice: agreedTotalPrice,
          currency: agreedCurrency,
          propertyTimezone: room.timezone || 'Asia/Kolkata',
          originalNightlyRate: room.pricePerNight,
          originalCurrency: room.currency || 'INR',
          status: 'confirmed',
          paymentStatus: 'paid_mock',
        });
      } else {
        throw err;
      }
    }

    const populatedBooking = await Booking.findById(bookingCreated._id)
      .populate('room', 'title slug category coverImage country city state timezone currency')
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Reservation confirmed successfully.',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated customer's booking history
 */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', 'title slug category coverImage pricePerNight maxGuests country city timezone currency')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve booking details by ID with ownership enforcement
 */
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid booking identifier.' });
      return;
    }

    const booking = await Booking.findById(id)
      .populate('room')
      .populate('user', 'name email');

    if (!booking) {
      res.status(404).json({ message: 'Booking reservation not found.' });
      return;
    }

    const isOwner = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Access denied: You are not authorized to view this reservation.' });
      return;
    }

    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a reservation with ownership verification and refund simulation
 */
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid booking identifier.' });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Access denied: You cannot cancel a reservation that is not yours.' });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ message: 'This reservation is already cancelled.' });
      return;
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded_mock';
    await booking.save();

    res.status(200).json({
      message: 'Reservation cancelled and mock refund processed successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};
