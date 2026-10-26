import { Router } from 'express';
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public availability checking
router.get('/check-availability', checkAvailability);

// Authenticated booking operations
router.post('/', authenticate, createBooking);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
