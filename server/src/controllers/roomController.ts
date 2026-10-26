import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/Room';

export const getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, minPrice, maxPrice, guests, search, country, countryCode, city, state } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (countryCode && countryCode !== 'all') {
      filter.countryCode = (countryCode as string).toUpperCase();
    } else if (country && country !== 'all') {
      filter.$or = [
        { country: new RegExp(`^${country}$`, 'i') },
        { countryCode: (country as string).toUpperCase() },
      ];
    }

    if (city && city !== 'all') {
      filter.city = new RegExp(`^${(city as string).trim()}$`, 'i');
    }

    if (state && state !== 'all') {
      filter.state = new RegExp(`^${(state as string).trim()}$`, 'i');
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    if (guests) {
      filter.maxGuests = { $gte: Number(guests) };
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const orConditions = [
        { title: searchRegex },
        { tagline: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
        { country: searchRegex },
        { state: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: orConditions }];
        delete filter.$or;
      } else {
        filter.$or = orConditions;
      }
    }

    const rooms = await Room.find(filter).sort({ pricePerNight: 1 });
    res.status(200).json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedRooms = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find({
      isActive: true,
      'hotspotMeta.heroFeatured': true,
    }).limit(3);

    res.status(200).json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug, isActive: true });

    if (!room) {
      res.status(404).json({ message: `Room with identifier '${slug}' was not found.` });
      return;
    }

    res.status(200).json({ room });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available destination taxonomy (countries and cities)
 */
export const getDestinations = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const activeRooms = await Room.find({ isActive: true }).select('country countryCode city state');

    const destinationMap = new Map<string, { country: string; countryCode: string; cities: Set<string> }>();

    activeRooms.forEach((r) => {
      const code = r.countryCode || 'IN';
      if (!destinationMap.has(code)) {
        destinationMap.set(code, {
          country: r.country || 'India',
          countryCode: code,
          cities: new Set<string>(),
        });
      }
      if (r.city) {
        destinationMap.get(code)!.cities.add(r.city);
      }
    });

    const destinations = Array.from(destinationMap.values()).map((d) => ({
      country: d.country,
      countryCode: d.countryCode,
      cities: Array.from(d.cities).sort(),
    }));

    res.status(200).json({ destinations });
  } catch (error) {
    next(error);
  }
};
