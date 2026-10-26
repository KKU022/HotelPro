import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Printer, CreditCard, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bookingsService } from '../services/bookingsService';
import type { Booking } from '../services/types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const BookingDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await bookingsService.getBookingById(id);
        setBooking(res.booking);
      } catch (err: any) {
        setError(err.message || 'Could not load reservation details.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBooking();
    }
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center pt-24 text-stone-400">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center pt-24 text-center px-6">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-light text-stone-100 mb-2">Reservation Not Found</h2>
        <p className="text-xs text-stone-400 mb-6">{error || 'This reservation does not exist or you lack authorization.'}</p>
        <Link
          to="/bookings"
          className="px-6 py-2.5 rounded-full bg-amber-500 text-stone-950 font-medium text-xs uppercase tracking-wider"
        >
          Return to My Stays
        </Link>
      </div>
    );
  }

  const currency = booking.currency || 'INR';
  const propertyTz = booking.propertyTimezone || booking.room?.timezone || 'Asia/Kolkata';

  const checkInDateFormatted = formatDate(booking.checkIn, i18n.language as any, propertyTz);
  const checkOutDateFormatted = formatDate(booking.checkOut, i18n.language as any, propertyTz);
  const isConfirmed = booking.status === 'confirmed';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{i18n.language === 'hi' ? 'मेरी बुकिंग्स पर वापस जाएं' : 'Back to My Stays'}</span>
        </Link>

        {/* Receipt Container */}
        <div className="rounded-3xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl">
          {/* Top Banner */}
          <div className="p-8 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isConfirmed ? (i18n.language === 'hi' ? 'आरक्षण पुष्टीकृत' : 'Reservation Confirmed') : (i18n.language === 'hi' ? 'आरक्षण रद्द' : 'Reservation Cancelled')}
              </div>
              <h1 className="text-2xl font-light text-stone-100">
                {t('receipt.title')}
              </h1>
              <span className="text-xs text-stone-400 font-mono">
                {t('receipt.bookingId')}: #{booking._id.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="p-3 rounded-full bg-stone-950 border border-stone-800 text-stone-300 hover:text-white transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Room Summary Header */}
          <div className="p-8 border-b border-stone-800 flex flex-col sm:flex-row gap-6 items-center">
            <img
              src={booking.room.coverImage}
              alt={booking.room.title}
              className="w-full sm:w-44 h-32 rounded-2xl object-cover border border-stone-700/60"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                  {booking.room.category} Sanctuary
                </span>
                {booking.room.city && (
                  <>
                    <span className="text-stone-700">&bull;</span>
                    <span className="text-[10px] text-stone-300 font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3 text-amber-500" />
                      {booking.room.city}, {booking.room.state ? `${booking.room.state}, ` : ''}{booking.room.country}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-medium text-stone-100">
                {booking.room.title}
              </h2>
              <p className="text-xs text-stone-400 font-light">
                {booking.room.tagline}
              </p>
            </div>
          </div>

          {/* Booking Data Grid */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">
                {t('receipt.arrival')}
              </span>
              <span className="text-sm font-medium text-stone-200 block">{checkInDateFormatted}</span>
              <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-stone-500" />
                From 3:00 PM ({propertyTz})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">
                {t('receipt.departure')}
              </span>
              <span className="text-sm font-medium text-stone-200 block">{checkOutDateFormatted}</span>
              <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-stone-500" />
                Until 11:00 AM ({propertyTz})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">
                {t('receipt.guest')}
              </span>
              <span className="text-sm font-medium text-stone-200 block">{booking.user.name}</span>
              <span className="text-xs text-stone-500">{booking.user.email}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">
                {t('receipt.party')}
              </span>
              <span className="text-sm font-medium text-stone-200 block">
                {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'} &bull; {t('receipt.nights', { nights: booking.totalNights })}
              </span>
              <span className="text-xs text-stone-500">
                Local operating time zone: {propertyTz}
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-8 bg-stone-950/50 space-y-3">
            <h3 className="text-xs font-mono uppercase text-amber-500 tracking-widest mb-4">
              {i18n.language === 'hi' ? 'भुगतान विवरण' : 'Payment Summary'}
            </h3>

            <div className="flex justify-between text-xs text-stone-400">
              <span>
                {i18n.language === 'hi' ? 'कमरे का किराया' : 'Nightly Rate'} ({formatCurrency(booking.nightlyRate, currency, i18n.language as any)} &times; {booking.totalNights} {i18n.language === 'hi' ? 'रातें' : 'nights'})
              </span>
              <span className="text-stone-200">
                {formatCurrency(booking.nightlyRate * booking.totalNights, currency, i18n.language as any)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-stone-400">
              <span>{i18n.language === 'hi' ? 'पर्यावरण संरक्षण एवं कर (12%)' : 'Environmental Preservation Fee & Tax (12%)'}</span>
              <span className="text-stone-200">
                {formatCurrency(Math.round(booking.totalPrice - booking.nightlyRate * booking.totalNights), currency, i18n.language as any)}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-stone-800 text-sm font-medium text-stone-100">
              <span>{t('receipt.totalPaid')}</span>
              <span className="text-amber-400 font-mono text-base">
                {formatCurrency(booking.totalPrice, currency, i18n.language as any)}
              </span>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                {i18n.language === 'hi'
                  ? 'भुगतान विधि: सिमुलेटेड कार्ड (अंतिम •••• 4242)'
                  : 'Payment Method: Simulated Visa Card (Ending in •••• 4242)'}
              </span>
              <span className="font-mono text-amber-400 uppercase text-[10px]">
                {booking.paymentStatus === 'paid_mock'
                  ? (i18n.language === 'hi' ? 'सत्यापन संपन्न' : 'AUTHORIZATION COMPLETED')
                  : (i18n.language === 'hi' ? 'धनवापसी संसाधित' : 'REFUND PROCESSED')}
              </span>
            </div>

            <p className="text-[10px] text-stone-400 font-light mt-3">
              {t('receipt.timezoneNote', { tz: propertyTz })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

