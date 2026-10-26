import { Router } from 'express';
import {
  getAdminMetrics,
  getAdminRooms,
  createAdminRoom,
  updateAdminRoom,
  toggleRoomStatus,
  getAdminBookings,
  updateBookingStatus,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with authentication and admin role enforcement
router.use(authenticate, requireAdmin);

router.get('/metrics', getAdminMetrics);

// Room Inventory Management
router.get('/rooms', getAdminRooms);
router.post('/rooms', createAdminRoom);
router.put('/rooms/:id', updateAdminRoom);
router.patch('/rooms/:id/status', toggleRoomStatus);

// Booking Reservation Operations
router.get('/bookings', getAdminBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
