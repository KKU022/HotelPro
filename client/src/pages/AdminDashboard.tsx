import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  CalendarCheck,
  Building,
  Plus,
  Edit,
  Power,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Coins,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import type { AdminMetrics, Booking, Room } from '../services/types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Room Inventory Filters
  const [roomCountryFilter, setRoomCountryFilter] = useState('all');
  const [roomSearch, setRoomSearch] = useState('');

  // Bookings Filter
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    title: '',
    slug: '',
    tagline: '',
    category: 'Suite' as 'Chalet' | 'Suite' | 'Villa' | 'Cabin',
    pricePerNight: 12500,
    maxGuests: 4,
    country: 'India',
    countryCode: 'IN',
    city: 'Indore',
    state: 'Madhya Pradesh',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    coverImage: '',
    gallery: '',
    amenities: '',
    heroFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        navigate('/login');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsRes, roomsRes, bookingsRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.getRooms(),
        adminService.getBookings(bookingStatusFilter, bookingSearch),
      ]);
      setMetrics(metricsRes.metrics);
      setRooms(roomsRes.rooms);
      setBookings(bookingsRes.bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin, bookingStatusFilter, bookingSearch]);

  const handleToggleRoomStatus = async (id: string) => {
    try {
      const res = await adminService.toggleRoomStatus(id);
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const res = await adminService.updateBookingStatus(id, newStatus);
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingRoomId(null);
    setRoomFormData({
      title: '',
      slug: '',
      tagline: '',
      category: 'Suite',
      pricePerNight: 12500,
      maxGuests: 4,
      country: 'India',
      countryCode: 'IN',
      city: 'Indore',
      state: 'Madhya Pradesh',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
      gallery: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
      amenities: 'Heritage Courtyard, Teak Daybed, Private Plunge Tub, High-Speed Wi-Fi',
      heroFeatured: false,
      isActive: true,
    });
    setShowRoomModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room._id);
    setRoomFormData({
      title: room.title,
      slug: room.slug,
      tagline: room.tagline,
      category: room.category,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      country: room.country || 'India',
      countryCode: room.countryCode || 'IN',
      city: room.city || 'Indore',
      state: room.state || '',
      timezone: room.timezone || 'Asia/Kolkata',
      currency: room.currency || 'INR',
      coverImage: room.coverImage,
      gallery: room.gallery.join(', '),
      amenities: room.amenities.join(', '),
      heroFeatured: room.hotspotMeta?.heroFeatured || false,
      isActive: room.isActive,
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: roomFormData.title,
        slug: roomFormData.slug,
        tagline: roomFormData.tagline,
        category: roomFormData.category,
        pricePerNight: Number(roomFormData.pricePerNight),
        maxGuests: Number(roomFormData.maxGuests),
        country: roomFormData.country,
        countryCode: roomFormData.countryCode.toUpperCase(),
        city: roomFormData.city,
        state: roomFormData.state,
        timezone: roomFormData.timezone,
        currency: roomFormData.currency.toUpperCase(),
        coverImage: roomFormData.coverImage,
        gallery: roomFormData.gallery.split(',').map((u) => u.trim()).filter((u) => u.length > 0),
        amenities: roomFormData.amenities.split(',').map((a) => a.trim()).filter((a) => a.length > 0),
        hotspotMeta: {
          heroFeatured: roomFormData.heroFeatured,
          pinPosition: { x: 50, y: 50 },
        },
        isActive: roomFormData.isActive,
      };

      if (editingRoomId) {
        await adminService.updateRoom(editingRoomId, payload);
        setActionMessage('Sanctuary updated successfully.');
      } else {
        await adminService.createRoom(payload);
        setActionMessage('New sanctuary added to collection.');
      }

      setShowRoomModal(false);
      setTimeout(() => setActionMessage(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save sanctuary.');
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (roomCountryFilter !== 'all' && (r.countryCode || 'IN') !== roomCountryFilter) return false;
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.country?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-24 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrative Operations
            </div>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-stone-100">
              {t('admin.portalTitle')}
            </h1>
            <p className="text-xs text-stone-400 mt-1 font-mono">
              {t('admin.gmTitle')} <span className="text-stone-200">{user?.name}</span> ({user?.email}) &bull; Default TZ: Asia/Kolkata (IST)
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-stone-900/80 p-1.5 rounded-full border border-stone-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                activeTab === 'overview' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {t('admin.overviewTab')}
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                activeTab === 'rooms' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {t('admin.roomsTab')} ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                activeTab === 'bookings' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              {t('admin.bookingsTab')} ({bookings.length})
            </button>
          </div>
        </div>

        {/* Notifications */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="py-12 flex items-center justify-center gap-3 text-stone-400">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest">Loading Operations Data...</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & REAL-DATA METRICS */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-850">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono mb-3">
                  <span>{t('admin.grossRevenue')}</span>
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-light text-stone-100 font-mono">
                  {formatCurrency(metrics.totalRevenue, 'INR', i18n.language as any)}
                </div>
                <span className="text-[11px] text-emerald-400/90 font-mono mt-1 block">
                  Normalized INR across all confirmed stays
                </span>
              </div>

              {/* Occupancy Rate */}
              <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-850">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono mb-3">
                  <span>{t('admin.occupancy')}</span>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-light text-stone-100 font-mono">
                  {metrics.occupancyRate}%
                </div>
                <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                  {metrics.activeRooms} operational sanctuaries
                </span>
              </div>

              {/* Total Bookings */}
              <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-850">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono mb-3">
                  <span>{t('admin.confirmedStays')}</span>
                  <CalendarCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-light text-stone-100 font-mono">
                  {metrics.confirmedBookings}
                </div>
                <span className="text-[11px] text-stone-500 font-mono mt-1 block">
                  {metrics.cancelledBookings} cancelled
                </span>
              </div>

              {/* Total Customers */}
              <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-850">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono mb-3">
                  <span>REGISTERED GUESTS</span>
                  <Building className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-light text-stone-100 font-mono">
                  {metrics.totalCustomers}
                </div>
                <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                  Active member profiles
                </span>
              </div>
            </div>

            {/* Quick Status Summary */}
            <div className="p-8 rounded-3xl bg-stone-900/40 border border-stone-850 space-y-4">
              <h3 className="text-base font-medium text-stone-200">
                HotelPro India-First Fleet Health Summary
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed max-w-3xl font-light">
                HotelPro operates an India-first luxury sanctuary portfolio with primary headquarters and featured sanctuaries in <strong>Indore, Madhya Pradesh</strong>, along with properties across Ujjain, Bhopal, Manali, Udaipur, Goa, Kochi, and international outposts in Dubai, Paris, London, and Bali. All financial balances are converted and snapshot safely using the documented INR conversion policy. Server health is monitored via the public <code>/api/health</code> endpoint.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ROOM INVENTORY MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-light text-stone-100">{t('admin.roomsTab')}</h2>
                <p className="text-xs text-stone-400">Oversee Indian & international sanctuaries, pricing, and activation states.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Country filter */}
                <select
                  value={roomCountryFilter}
                  onChange={(e) => setRoomCountryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="all">All Countries</option>
                  <option value="IN">India (IN)</option>
                  <option value="AE">UAE (AE)</option>
                  <option value="FR">France (FR)</option>
                  <option value="GB">UK (GB)</option>
                  <option value="ID">Indonesia (ID)</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search city or name..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none"
                  />
                </div>

                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-md flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {t('admin.addSanctuary')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-stone-850 bg-stone-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-4">Sanctuary</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Nightly Rate</th>
                    <th className="p-4">Time Zone</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {filteredRooms.map((room) => (
                    <tr key={room._id} className="hover:bg-stone-900/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={room.coverImage}
                          alt={room.title}
                          className="w-12 h-10 rounded-lg object-cover border border-stone-800"
                        />
                        <div>
                          <span className="font-medium text-stone-100 block">{room.title}</span>
                          <span className="text-[10px] text-stone-500 font-mono">/{room.slug}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-200">{room.city || 'Indore'}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{room.countryCode || 'IN'} &bull; {room.country || 'India'}</div>
                      </td>
                      <td className="p-4 font-mono">{room.category}</td>
                      <td className="p-4 font-mono text-amber-400 font-medium">
                        {formatCurrency(room.pricePerNight, room.currency || 'INR', i18n.language as any)}
                        <span className="text-[10px] text-stone-400 block font-normal">
                          {room.currency || 'INR'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-stone-400 text-[11px]">
                        {room.timezone || 'Asia/Kolkata'}
                      </td>
                      <td className="p-4">
                        {room.hotspotMeta?.heroFeatured ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                            HERO PIN
                          </span>
                        ) : (
                          <span className="text-stone-600 font-mono text-[10px]">STANDARD</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                            room.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {room.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                          title="Edit sanctuary"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleRoomStatus(room._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            room.isActive ? 'bg-stone-800 hover:bg-red-500/20 text-red-400' : 'bg-stone-800 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                          title={room.isActive ? 'Deactivate sanctuary' : 'Activate sanctuary'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESERVATIONS OVERSIGHT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-light text-stone-100">{t('admin.bookingsTab')}</h2>
                <p className="text-xs text-stone-400">Oversee guest bookings, snapshotted currencies, and operational statuses.</p>
              </div>

              {/* Status filter and search */}
              <div className="flex items-center gap-3">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guest or sanctuary..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-stone-850 bg-stone-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Sanctuary & Destination</th>
                    <th className="p-4">Dates (IST)</th>
                    <th className="p-4">Charged Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {bookings.map((b) => {
                    const currency = b.currency || 'INR';
                    return (
                      <tr key={b._id} className="hover:bg-stone-900/40 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-amber-400">
                          #{b._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-stone-100 block">{b.user?.name}</span>
                          <span className="text-[10px] text-stone-500">{b.user?.email}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-stone-200 block">{b.room?.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {b.room?.city}, {b.room?.countryCode || 'IN'}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400 font-mono">
                          {formatDate(b.checkIn, i18n.language as any, 'Asia/Kolkata')} &rarr;{' '}
                          {formatDate(b.checkOut, i18n.language as any, 'Asia/Kolkata')}
                        </td>
                        <td className="p-4 font-mono font-medium text-stone-100">
                          {formatCurrency(b.totalPrice, currency, i18n.language as any)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {b.status === 'confirmed' ? (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[11px]"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px]"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SANCTUARY */}
        {showRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light text-stone-100">
                  {editingRoomId ? 'Edit Sanctuary Record' : 'Add New Sanctuary'}
                </h3>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Title</label>
                    <input
                      type="text"
                      value={roomFormData.title}
                      onChange={(e) => setRoomFormData({ ...roomFormData, title: e.target.value })}
                      required
                      placeholder="e.g. Ahilya Heritage Courtyard Suite"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      value={roomFormData.slug}
                      onChange={(e) => setRoomFormData({ ...roomFormData, slug: e.target.value })}
                      required
                      placeholder="ahilya-heritage-courtyard-suite"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={roomFormData.tagline}
                    onChange={(e) => setRoomFormData({ ...roomFormData, tagline: e.target.value })}
                    required
                    placeholder="Carved sandstone courtyards, fountain verandas, and regal Malwa calm..."
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                  />
                </div>

                {/* Location Fields: Country, Code, City, State */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-500 block mb-1">Country</label>
                    <input
                      type="text"
                      value={roomFormData.country}
                      onChange={(e) => setRoomFormData({ ...roomFormData, country: e.target.value })}
                      required
                      placeholder="India"
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-500 block mb-1">Country Code</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={roomFormData.countryCode}
                      onChange={(e) => setRoomFormData({ ...roomFormData, countryCode: e.target.value.toUpperCase() })}
                      required
                      placeholder="IN"
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-500 block mb-1">City</label>
                    <input
                      type="text"
                      value={roomFormData.city}
                      onChange={(e) => setRoomFormData({ ...roomFormData, city: e.target.value })}
                      required
                      placeholder="Indore"
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-amber-500 block mb-1">State / Province</label>
                    <input
                      type="text"
                      value={roomFormData.state}
                      onChange={(e) => setRoomFormData({ ...roomFormData, state: e.target.value })}
                      placeholder="Madhya Pradesh"
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100"
                    />
                  </div>
                </div>

                {/* Financial and Time Zone */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Category</label>
                    <select
                      value={roomFormData.category}
                      onChange={(e: any) => setRoomFormData({ ...roomFormData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                    >
                      <option value="Chalet">Chalet</option>
                      <option value="Suite">Suite</option>
                      <option value="Villa">Villa</option>
                      <option value="Cabin">Cabin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Currency Code</label>
                    <select
                      value={roomFormData.currency}
                      onChange={(e) => setRoomFormData({ ...roomFormData, currency: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 font-mono"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Nightly Rate</label>
                    <input
                      type="number"
                      value={roomFormData.pricePerNight}
                      onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: Number(e.target.value) })}
                      required
                      min="1"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Time Zone (IANA)</label>
                    <input
                      type="text"
                      value={roomFormData.timezone}
                      onChange={(e) => setRoomFormData({ ...roomFormData, timezone: e.target.value })}
                      required
                      placeholder="Asia/Kolkata"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={roomFormData.maxGuests}
                    onChange={(e) => setRoomFormData({ ...roomFormData, maxGuests: Number(e.target.value) })}
                    required
                    min="1"
                    max="20"
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={roomFormData.coverImage}
                    onChange={(e) => setRoomFormData({ ...roomFormData, coverImage: e.target.value })}
                    required
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Gallery URLs (Comma separated)</label>
                  <input
                    type="text"
                    value={roomFormData.gallery}
                    onChange={(e) => setRoomFormData({ ...roomFormData, gallery: e.target.value })}
                    placeholder="https://..., https://..."
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={roomFormData.amenities}
                    onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                    placeholder="Heritage Courtyard, Teak Daybed, Private Plunge Tub"
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomFormData.heroFeatured}
                      onChange={(e) => setRoomFormData({ ...roomFormData, heroFeatured: e.target.checked })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Featured Hero Hotspot</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomFormData.isActive}
                      onChange={(e) => setRoomFormData({ ...roomFormData, isActive: e.target.checked })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Active in Public Discovery</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-5 py-2 rounded-full bg-stone-800 text-stone-300 text-xs uppercase tracking-wider"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-amber-500 text-stone-950 font-medium text-xs uppercase tracking-wider"
                  >
                    {t('admin.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

