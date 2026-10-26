import { Router } from 'express';
import { getAllRooms, getFeaturedRooms, getRoomBySlug, getDestinations } from '../controllers/roomController';

const router = Router();

router.get('/', getAllRooms);
router.get('/featured', getFeaturedRooms);
router.get('/destinations', getDestinations);
router.get('/:slug', getRoomBySlug);

export default router;
