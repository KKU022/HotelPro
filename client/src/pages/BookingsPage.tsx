import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bookingsService } from '../services/bookingsService';
import type { Booking } from '../services/types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const BookingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsService.getMyBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const handleCancelBooking = async (id: string) => {
    const confirmPrompt =
      i18n.language === 'hi'
        ? 'क्या आप निश्चित रूप से इस आरक्षण को रद्द करना चाहते हैं? एक सिमुलेटेड रिफंड संसाधित किया जाएगा।'
        : 'Are you sure you want to cancel this reservation? A simulated refund will be processed.';

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    setCancellingId(id);
    setActionError('');
    try {
      await bookingsService.cancelBooking(id);
      await fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block mb-2">
              {i18n.language === 'hi' ? 'अतिथि पोर्टल' : 'Guest Portal'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-stone-100">
              {t('bookings.title')}
            </h1>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-xs text-stone-200 uppercase tracking-wider font-medium transition-colors"
          >
            <span>{t('bookings.bookAnother')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-stone-900/60 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-stone-900/30 border border-stone-850 px-6">
            <CalendarCheck className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-200">{t('bookings.noBookingsTitle')}</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto mb-6">
              {t('bookings.noBookingsDesc')}
            </p>
            <Link
              to="/rooms"
              className="px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-medium text-xs tracking-wider uppercase"
            >
              {t('bookings.exploreButton')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const isConfirmed = b.status === 'confirmed';
              const checkInDateFormatted = formatDate(b.checkIn, i18n.language as any, 'Asia/Kolkata');
              const checkOutDateFormatted = formatDate(b.checkOut, i18n.language as any, 'Asia/Kolkata');
              const currency = b.currency || 'INR';

              return (
                <div
                  key={b._id}
                  className="rounded-3xl bg-stone-900/80 border border-stone-850 p-6 sm:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-xl hover:border-stone-800 transition-colors"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <img
                      src={b.room.coverImage}
                      alt={b.room.title}
                      className="w-full sm:w-32 h-28 rounded-2xl object-cover border border-stone-800"
                    />

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400">
                          {b.room.category}
                        </span>
                        <span className="text-stone-700">&bull;</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {t('bookings.ref', { id: b._id.slice(-6).toUpperCase() })}
                        </span>
                        {b.room.city && (
                          <>
                            <span className="text-stone-700">&bull;</span>
                            <span className="text-[10px] text-stone-300 font-medium">
                              {b.room.city}, {b.room.countryCode || 'IN'}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-stone-100 mb-2">
                        {b.room.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-stone-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          {checkInDateFormatted} &rarr; {checkOutDateFormatted} ({b.totalNights} {i18n.language === 'hi' ? 'रातें' : 'nights'})
                        </span>
                        <span className="text-stone-400 font-mono">
                          {b.guests} {b.guests === 1 ? (i18n.language === 'hi' ? 'अतिथि' : 'Guest') : (i18n.language === 'hi' ? 'अतिथि' : 'Guests')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing, Status & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-800 gap-3">
                    <div className="text-left md:text-right">
                      <div className="text-lg font-semibold text-stone-100 font-mono">
                        {formatCurrency(b.totalPrice, currency, i18n.language as any)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase ${
                            isConfirmed
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isConfirmed ? t('bookings.confirmed') : t('bookings.cancelled')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-stone-950 text-[10px] font-mono text-stone-400 border border-stone-800">
                          {b.paymentStatus === 'paid_mock' ? t('bookings.paid') : t('bookings.refunded')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/bookings/${b._id}`)}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
                      >
                        {t('bookings.receiptButton')}
                      </button>

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {cancellingId === b._id ? t('bookings.cancelling') : t('bookings.cancelButton')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

