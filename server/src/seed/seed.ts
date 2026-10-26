import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { Booking } from '../models/Booking';

const SEED_ROOMS = [
  // 1. INDORE, MADHYA PRADESH, INDIA (Default Featured City) - HERO FEATURED
  {
    title: 'Ahilya Heritage Courtyard Suite',
    slug: 'ahilya-heritage-courtyard-suite-indore',
    tagline: 'Imperial stone colonnades and quiet fountain courtyards in the cultural heart of Malwa.',
    category: 'Suite' as const,
    pricePerNight: 14500, // INR
    maxGuests: 3,
    country: 'India',
    countryCode: 'IN',
    city: 'Indore',
    state: 'Madhya Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/ahilya_courtyard_indore.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Private Courtyard Bath', 'Artisanal Malwi Tea Bar', 'Teak Wood Interiors', 'Bang & Olufsen Sound', 'High-Speed Wi-Fi', 'Chauffeur Valet'],
    hotspotMeta: {
      heroFeatured: true,
      pinPosition: { x: 38, y: 52 },
    },
    isActive: true,
  },

  // 2. INDORE, MADHYA PRADESH, INDIA
  {
    title: 'Ralamandal Wilderness Ridge Chalet',
    slug: 'ralamandal-wilderness-ridge-chalet-indore',
    tagline: 'Perched in the gentle teakwood hills overlooking Indore with a private sunset plunge pool.',
    category: 'Chalet' as const,
    pricePerNight: 18500, // INR
    maxGuests: 4,
    country: 'India',
    countryCode: 'IN',
    city: 'Indore',
    state: 'Madhya Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/ralamandal_chalet_indore.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Hillside Plunge Pool', 'Fire Pit Terrace', 'Forest Hiking Access', 'Organic Breakfast', 'EV Charging'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 50, y: 50 },
    },
    isActive: true,
  },

  // 3. UJJAIN, MADHYA PRADESH, INDIA
  {
    title: 'Mahakal Ghat Riverside Villa',
    slug: 'mahakal-ghat-riverside-villa-ujjain',
    tagline: 'Spiritual quiet on the sacred Shipra waters with carved stone terraces and evening brass lamp rituals.',
    category: 'Villa' as const,
    pricePerNight: 12500, // INR
    maxGuests: 5,
    country: 'India',
    countryCode: 'IN',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/mahakal_villa_ujjain.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Riverfront Verandah', 'Morning Yoga Pavilion', 'Pure Vegetarian Dining', 'VIP Temple Pass Assistance'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 45, y: 55 },
    },
    isActive: true,
  },

  // 4. BHOPAL, MADHYA PRADESH, INDIA
  {
    title: 'Upper Lake Royal Waterfront Suite',
    slug: 'upper-lake-royal-waterfront-suite-bhopal',
    tagline: 'Panoramic views across the serene Bhojtal waters with Mughal arches and private sundeck.',
    category: 'Suite' as const,
    pricePerNight: 13800, // INR
    maxGuests: 2,
    country: 'India',
    countryCode: 'IN',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/upper_lake_suite_bhopal.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Private Lake View Balcony', 'Deep Soaking Tub', 'In-room High Tea', 'Artisanal Coffee'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 50, y: 50 },
    },
    isActive: true,
  },

  // 5. MANALI, HIMACHAL PRADESH, INDIA - HERO FEATURED
  {
    title: 'Solang Pine Alpine Chalet',
    slug: 'solang-pine-alpine-chalet-manali',
    tagline: 'Perched in misty Himalayan pine forests with open-sky cedar hot tub and mountain glacier vistas.',
    category: 'Chalet' as const,
    pricePerNight: 22000, // INR
    maxGuests: 4,
    country: 'India',
    countryCode: 'IN',
    city: 'Manali',
    state: 'Himachal Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/solang_chalet_manali.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Geothermal Open-Air Tub', 'Wood Fireplace', 'Heated Wooden Floors', 'Ski & Trek Equipment Room'],
    hotspotMeta: {
      heroFeatured: true,
      pinPosition: { x: 68, y: 42 },
    },
    isActive: true,
  },

  // 6. UDAIPUR, RAJASTHAN, INDIA
  {
    title: 'Lake Pichola Palace Villa',
    slug: 'lake-pichola-palace-villa-udaipur',
    tagline: 'Gilded marble jharokhas, private candlelit pool, and unbroken vistas of the floating Lake Palace.',
    category: 'Villa' as const,
    pricePerNight: 35000, // INR
    maxGuests: 6,
    country: 'India',
    countryCode: 'IN',
    city: 'Udaipur',
    state: 'Rajasthan',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/lake_pichola_palace_udaipur.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Infinity Lake Pool', 'Private Boat Transfer', 'Personal Butler Service', 'Royal Rajput Dinners'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 30, y: 70 },
    },
    isActive: true,
  },

  // 7. GOA, INDIA
  {
    title: 'Anjuna Ocean Cliff Villa',
    slug: 'anjuna-ocean-cliff-villa-goa',
    tagline: 'Secluded laterite stone cliff villa with private infinity pool overlooking the Arabian Sea surf.',
    category: 'Villa' as const,
    pricePerNight: 28000, // INR
    maxGuests: 6,
    country: 'India',
    countryCode: 'IN',
    city: 'Goa',
    state: 'Goa',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/anjuna_cliff_villa_goa.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Cliffside Infinity Edge', 'Direct Beach Cove Trail', 'Outdoor Barbecue Pergola', 'Daily Housekeeping'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 40, y: 60 },
    },
    isActive: true,
  },

  // 8. KOCHI, KERALA, INDIA
  {
    title: 'Vembanad Water Sanctuary Cabin',
    slug: 'vembanad-water-sanctuary-cabin-kochi',
    tagline: 'Restorative teakwood sanctuary floating along emerald backwaters and swaying coconut groves.',
    category: 'Cabin' as const,
    pricePerNight: 16000, // INR
    maxGuests: 2,
    country: 'India',
    countryCode: 'IN',
    city: 'Kochi',
    state: 'Kerala',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '/sanctuaries/vembanad_cabin_kochi.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Backwater Deck', 'Ayurvedic Massage Setup', 'Traditional Canoe Rides', 'Chef Prepared Meals'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 50, y: 80 },
    },
    isActive: true,
  },

  // 9. DUBAI, UNITED ARAB EMIRATES - HERO FEATURED (INTERNATIONAL)
  {
    title: 'Palm Jumeirah Skyline Water Villa',
    slug: 'palm-jumeirah-skyline-water-villa-dubai',
    tagline: 'Private overwater terrace facing the illuminated Arabian Gulf Marina skyline.',
    category: 'Villa' as const,
    pricePerNight: 1800, // AED (~INR 42,390)
    maxGuests: 6,
    country: 'United Arab Emirates',
    countryCode: 'AE',
    city: 'Dubai',
    state: 'Dubai',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    coverImage: '/sanctuaries/palm_jumeirah_villa_dubai.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Private Beach Access', 'Temperature-Controlled Infinity Pool', 'Yacht Mooring', '24/7 Concierge'],
    hotspotMeta: {
      heroFeatured: true,
      pinPosition: { x: 80, y: 35 },
    },
    isActive: true,
  },

  // 10. PARIS, FRANCE (INTERNATIONAL)
  {
    title: 'Le Marais Private Courtyard Suite',
    slug: 'le-marais-private-courtyard-suite-paris',
    tagline: 'Quiet Haussmannian salon with exposed limestone masonry and herringbone oak parquet.',
    category: 'Suite' as const,
    pricePerNight: 420, // EUR (~INR 39,144)
    maxGuests: 2,
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    state: 'Île-de-France',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    coverImage: '/sanctuaries/marais_suite_paris.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: ['Private French Courtyard', 'Artisan Bakery Delivery', 'Antique Marble Fireplace', 'Wine Cellar Cabinet'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 50, y: 50 },
    },
    isActive: true,
  },

  // 11. LONDON, UNITED KINGDOM (INTERNATIONAL)
  {
    title: 'Kensington Royal Mews Chalet',
    slug: 'kensington-royal-mews-chalet-london',
    tagline: 'Discreet cobble-lane residence offering English brass warmth, open hearth, and garden terrace.',
    category: 'Chalet' as const,
    pricePerNight: 480, // GBP (~INR 53,472)
    maxGuests: 4,
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    state: 'Greater London',
    timezone: 'Europe/London',
    currency: 'GBP',
    coverImage: '/sanctuaries/kensington_mews_london.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1558882224-dda166733046?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Private Walled Garden', 'Cast Iron Hearth', 'Library Room', 'Harrods Chauffeur Service'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 45, y: 45 },
    },
    isActive: true,
  },

  // 12. BALI, INDONESIA (INTERNATIONAL)
  {
    title: 'Ubud River Forest Sanctuary Cabin',
    slug: 'ubud-river-forest-sanctuary-cabin-bali',
    tagline: 'Open-air bamboo pavilions and mossy stream pools immersed in tropical canopy stillness.',
    category: 'Cabin' as const,
    pricePerNight: 280, // USD (~INR 24,220)
    maxGuests: 2,
    country: 'Indonesia',
    countryCode: 'ID',
    city: 'Bali',
    state: 'Ubud',
    timezone: 'Asia/Makassar',
    currency: 'USD',
    coverImage: '/sanctuaries/ubud_cabin_bali.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Stream Plunge Pool', 'Jungle Deck Yoga', 'Organic Balinese Cuisine', 'Sound Bath Pavilion'],
    hotspotMeta: {
      heroFeatured: false,
      pinPosition: { x: 50, y: 50 },
    },
    isActive: true,
  },
];

async function runSeed() {
  const args = process.argv.slice(2);
  const hasConfirmFlag = args.includes('--confirm');

  console.log('=============================================');
  console.log('  HotelPro India-First & Global Seed Script  ');
  console.log('=============================================');

  if (!hasConfirmFlag) {
    console.error('❌ SEED ABORTED: Missing required confirmation flag.');
    console.error('👉 To execute the seed, run: npm run seed -- --confirm');
    process.exit(1);
  }

  if (env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.error('❌ SEED ABORTED: Destructive reset refused on production environment.');
    console.error('Set ALLOW_PROD_SEED=true only if you explicitly intend to reset production data.');
    process.exit(1);
  }

  const adminPassword = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ SEED ABORTED: ADMIN_PASSWORD environment variable is missing or less than 8 characters.');
    process.exit(1);
  }

  if (!env.MONGO_URI) {
    console.error('❌ SEED ABORTED: MONGO_URI is not configured in the environment.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to database: ${env.MONGO_URI.split('@').pop() || 'localhost'}...`);
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('Clearing existing bookings, rooms, and users...');
    const deletedBookings = await Booking.deleteMany({});
    const deletedRooms = await Room.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    console.log(`Cleared: ${deletedBookings.deletedCount} bookings, ${deletedRooms.deletedCount} rooms, ${deletedUsers.deletedCount} users.`);

    // 1. Provision Administrator
    console.log('Provisioning administrator...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      name: 'HotelPro General Manager',
      email: 'admin@hotelpro.luxury',
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Provisioned Administrator: ${admin.email} (ID: ${admin._id})`);

    // 2. Insert 12 Sanctuaries
    console.log('Inserting 12 verified Indian & International Sanctuaries...');
    const createdRooms = await Room.insertMany(SEED_ROOMS);
    console.log(`✅ Successfully inserted ${createdRooms.length} sanctuaries.`);

    // Verification of requirement: exactly 3 heroFeatured rooms
    const heroFeaturedCount = createdRooms.filter((r) => r.hotspotMeta.heroFeatured).length;
    console.log(`⭐ Hero Featured Rooms count: ${heroFeaturedCount} (Expected: 3)`);
    if (heroFeaturedCount !== 3) {
      throw new Error(`Integrity error: Expected exactly 3 hero featured rooms, got ${heroFeaturedCount}`);
    }

    // 3. Provision Sample Customer & Confirmed Booking in Indore property
    console.log('Provisioning sample customer...');
    const customerPasswordHash = await bcrypt.hash('GuestPass2026!', salt);
    const sampleCustomer = await User.create({
      name: 'Alexander Wright',
      email: 'alexander@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
    });

    const indoreRoom = createdRooms[0]; // Ahilya Heritage Courtyard Suite (Indore)
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    const sampleBooking = await Booking.create({
      room: indoreRoom._id,
      user: sampleCustomer._id,
      checkIn,
      checkOut,
      guests: 2,
      totalNights: 3,
      nightlyRate: indoreRoom.pricePerNight,
      totalPrice: indoreRoom.pricePerNight * 3,
      currency: indoreRoom.currency,
      propertyTimezone: indoreRoom.timezone,
      status: 'confirmed',
      paymentStatus: 'paid_mock',
    });
    console.log(`✅ Provisioned Sample Booking: ID ${sampleBooking._id} (₹${sampleBooking.totalPrice}) for ${sampleCustomer.email}`);

    console.log('\n=============================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log(`- Administrators: 1 (${admin.email})`);
    console.log(`- Customers:      1 (${sampleCustomer.email})`);
    console.log(`- Sanctuaries:    ${createdRooms.length} (3 hero featured, default city: Indore)`);
    console.log(`- Sample Booking: 1 (confirmed stay in ${indoreRoom.city}, ₹${sampleBooking.totalPrice})`);
    console.log('=============================================');
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

runSeed();
