import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bed,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CreditCard,
  MapPin,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { roomsService } from '../services/roomsService';
import { bookingsService } from '../services/bookingsService';
import type { Room } from '../services/types';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { displayPriceWithEstimate, formatCurrency, convertPrice } from '../utils/formatters';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currency } = useCurrency();
  const { t } = useTranslation();

  const [room, setRoom] = useState<Room | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Booking Form State
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string>('');

  // Default dates: tomorrow and 3 days later
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 4);

    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(threeDays.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await roomsService.getRoomBySlug(slug);
        setRoom(res.room);
        setActiveImage(res.room.coverImage);
      } catch (err: any) {
        setError(err.message || 'Sanctuary details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [slug]);

  // Calculate nights
  const totalNights = React.useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const nights = Math.round(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  }, [checkIn, checkOut]);

  // Check live availability whenever dates change
  useEffect(() => {
    const verifyAvailability = async () => {
      if (!room || !checkIn || !checkOut || totalNights <= 0) {
        setIsAvailable(null);
        return;
      }

      setIsCheckingAvail(true);
      setBookingError('');
      try {
        const res = await bookingsService.checkAvailability(room._id, checkIn, checkOut);
        setIsAvailable(res.isAvailable);
      } catch (err: any) {
        setIsAvailable(null);
        setBookingError(err.message);
      } finally {
        setIsCheckingAvail(false);
      }
    };

    const timer = setTimeout(verifyAvailability, 300);
    return () => clearTimeout(timer);
  }, [room, checkIn, checkOut, totalNights]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!room) return;
    if (totalNights <= 0) {
      setBookingError('Please choose a check-out date strictly after check-in.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await bookingsService.createBooking({
        roomId: room._id,
        checkIn,
        checkOut,
        guests,
        targetCurrency: currency,
      });
      setBookingSuccess('Reservation confirmed! Redirecting to your official pass...');
      setTimeout(() => {
        navigate(`/bookings/${res.booking._id}`);
      }, 1200);
    } catch (err: any) {
      setBookingError(err.message || 'Unable to complete reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center pt-24 text-stone-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono uppercase tracking-widest">Loading Sanctuary...</span>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center pt-24 text-center px-6">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-light text-stone-100 mb-2">Sanctuary Not Found</h2>
        <p className="text-sm text-stone-400 mb-6">{error || 'This property may have been retired or renamed.'}</p>
        <Link
          to="/rooms"
          className="px-6 py-2.5 rounded-full bg-amber-500 text-stone-950 font-medium text-xs uppercase tracking-wider"
        >
          {t('detail.backLink')}
        </Link>
      </div>
    );
  }

  // Price calculations in selected currency
  const convertedNightly = convertPrice(room.pricePerNight, room.currency || 'INR', currency);
  const subtotal = convertedNightly * totalNights;
  const taxes = currency === 'INR' ? Math.round(subtotal * 0.12) : Number((subtotal * 0.12).toFixed(2));
  const totalPrice = subtotal + taxes;

  const { formatted, isConverted, originalFormatted } = displayPriceWithEstimate(
    room.pricePerNight,
    room.currency || 'INR',
    currency
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('detail.backLink')}</span>
        </Link>

        {/* Header Title, Location & Category */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-mono tracking-wider text-amber-400 uppercase">
              <Sparkles className="w-3 h-3" />
              {room.category} Sanctuary
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-[11px] text-stone-300 font-mono">
              <MapPin className="w-3 h-3 text-amber-500" />
              {room.city}, {room.state ? `${room.state}, ` : ''}{room.country}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 font-mono">
              <Globe className="w-3 h-3 text-stone-500" />
              {room.timezone}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-stone-100 mb-3">
            {room.title}
          </h1>
          <p className="text-stone-400 text-sm sm:text-base font-light max-w-3xl leading-relaxed">
            {room.tagline}
          </p>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-16">
          <div className="lg:col-span-3 h-[420px] sm:h-[540px] rounded-3xl overflow-hidden border border-stone-850 shadow-2xl relative">
            <img
              src={activeImage}
              alt={room.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>

          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {[room.coverImage, ...room.gallery].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative flex-shrink-0 w-24 h-24 lg:w-full lg:h-[120px] rounded-2xl overflow-hidden border transition-all ${
                  activeImage === img ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-stone-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${room.title} thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Detail Layout: Specs + Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Description, Specs, Amenities */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-stone-900/60 border border-stone-850">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">{t('detail.capacity')}</span>
                  <span className="text-xs font-medium text-stone-200">{t('detail.maxGuests', { count: room.maxGuests })}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">Style</span>
                  <span className="text-xs font-medium text-stone-200">{room.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">{t('detail.checkInTime')}</span>
                  <span className="text-xs font-medium text-stone-200">From 3:00 PM ({room.timezone.split('/')[1] || 'Local'})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">{t('detail.checkOutTime')}</span>
                  <span className="text-xs font-medium text-stone-200">Until 11:00 AM ({room.timezone.split('/')[1] || 'Local'})</span>
                </div>
              </div>
            </div>

            {/* Curated Amenities */}
            <div>
              <h3 className="text-lg font-medium text-stone-100 mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t('detail.amenitiesTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-900/40 border border-stone-850 text-xs text-stone-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospitality Assurance */}
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-850 space-y-3">
              <h4 className="text-sm font-medium text-stone-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                {t('home.trustTitle')}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Every reservation includes verified contactless arrival instructions, high-speed fiber internet, artisanal morning provisions, and around-the-clock digital concierge dispatch. All linens are OEKO-TEX certified Belgian linen. Operating times align with {room.city} local time ({room.timezone}).
              </p>
            </div>
          </div>

          {/* Right Column: Reservation Sidebar Form */}
          <div className="sticky top-28 p-8 rounded-3xl bg-stone-900/90 border border-stone-800 backdrop-blur-xl shadow-2xl">
            <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-stone-800">
              <div>
                <span className="text-3xl font-light text-stone-100 font-mono">{formatted}</span>
                <span className="text-xs text-stone-400 font-light"> {t('detail.perNight')}</span>
                {isConverted && (
                  <span className="text-[10px] text-amber-400 font-mono block mt-1">
                    {t('detail.estimatedTag', { currency, original: originalFormatted })}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
                {t('detail.directRate')}
              </span>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs leading-relaxed text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                {bookingSuccess}
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                {/* Date pickers */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-stone-950 border border-stone-800">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-mono text-stone-500 block mb-1">
                      {t('search.checkIn')}
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="bg-transparent text-xs text-stone-200 focus:outline-none w-full cursor-pointer"
                    />
                  </div>
                  <div className="border-l border-stone-800 pl-3">
                    <label className="text-[9px] uppercase tracking-wider font-mono text-stone-500 block mb-1">
                      {t('search.checkOut')}
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="bg-transparent text-xs text-stone-200 focus:outline-none w-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Guests counter */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-stone-500 block mb-1">
                    {t('search.guests')} ({t('detail.maxGuests', { count: room.maxGuests })})
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="bg-transparent text-xs text-stone-200 focus:outline-none w-full cursor-pointer"
                  >
                    {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-stone-900">
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability status badge */}
                <div className="py-2 text-xs">
                  {isCheckingAvail ? (
                    <span className="text-stone-400 font-mono text-[11px] flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      {t('detail.checkingAvail')}
                    </span>
                  ) : isAvailable === true ? (
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('detail.availSuccess', { nights: totalNights })}
                    </span>
                  ) : isAvailable === false ? (
                    <span className="text-red-400 font-mono text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t('detail.availFail')}
                    </span>
                  ) : null}
                </div>

                {/* Price Calculation Breakdown in User Currency */}
                {totalNights > 0 && (
                  <div className="space-y-2 pt-4 border-t border-stone-800 text-xs text-stone-400 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-[11px]">
                        {t('detail.subtotal', { rate: formatCurrency(convertedNightly, currency), nights: totalNights })}
                      </span>
                      <span className="text-stone-200">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[11px]">{t('detail.taxes')}</span>
                      <span className="text-stone-200">{formatCurrency(taxes, currency)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stone-800 font-medium text-stone-100 text-sm">
                      <span className="font-sans">{t('detail.total')}</span>
                      <span className="text-amber-400">{formatCurrency(totalPrice, currency)}</span>
                    </div>
                  </div>
                )}

                {/* Simulated Payment Notice */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-950/60 border border-stone-800/60 text-[10px] text-stone-400">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{t('detail.mockNotice')}</span>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {bookingError}
                  </div>
                )}

                {/* Action button */}
                <button
                  type="submit"
                  disabled={bookingLoading || isAvailable === false || totalNights <= 0}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-medium text-xs tracking-wider uppercase transition-all shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : !isAuthenticated ? (
                    t('detail.signInToReserve')
                  ) : isAvailable === false ? (
                    t('detail.datesUnavailable')
                  ) : (
                    t('detail.confirmButton')
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
