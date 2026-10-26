import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Users, Sparkles, ArrowRight, RotateCcw, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { roomsService } from '../services/roomsService';
import type { Room, DestinationTaxonomy } from '../services/types';
import { useCurrency } from '../context/CurrencyContext';
import { displayPriceWithEstimate, formatCurrency } from '../utils/formatters';

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [destinations, setDestinations] = useState<DestinationTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (India-first friendly)
  const [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get('countryCode') || searchParams.get('country') || 'all');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [guestCount, setGuestCount] = useState<string>(searchParams.get('guests') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [maxPriceInr, setMaxPriceInr] = useState<number>(50000);

  const categories = [
    { label: t('categories.all'), value: 'all' },
    { label: t('categories.Chalet'), value: 'Chalet' },
    { label: t('categories.Villa'), value: 'Villa' },
    { label: t('categories.Suite'), value: 'Suite' },
    { label: t('categories.Cabin'), value: 'Cabin' },
  ];

  useEffect(() => {
    roomsService.getDestinations().then((res) => {
      setDestinations(res.destinations);
    }).catch(console.error);
  }, []);

  const currentCities = React.useMemo(() => {
    if (!selectedCountry || selectedCountry === 'all') {
      return Array.from(new Set(destinations.flatMap((d) => d.cities))).sort();
    }
    const found = destinations.find((d) => d.countryCode === selectedCountry || d.country.toLowerCase() === selectedCountry.toLowerCase());
    return found ? found.cities : [];
  }, [destinations, selectedCountry]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomsService.getAllRooms({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        countryCode: selectedCountry !== 'all' ? selectedCountry : undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        guests: guestCount ? parseInt(guestCount, 10) : undefined,
        maxPrice: maxPriceInr < 50000 ? maxPriceInr : undefined,
        search: searchQuery || undefined,
      });
      setRooms(res.rooms);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const p = new URLSearchParams();
    if (selectedCountry !== 'all') p.set('countryCode', selectedCountry);
    if (selectedCity !== 'all') p.set('city', selectedCity);
    if (selectedCategory !== 'all') p.set('category', selectedCategory);
    if (guestCount) p.set('guests', guestCount);
    if (searchQuery) p.set('search', searchQuery);
    setSearchParams(p, { replace: true });
  }, [selectedCountry, selectedCity, selectedCategory, guestCount, maxPriceInr, searchQuery]);

  const resetFilters = () => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setSelectedCategory('all');
    setGuestCount('');
    setSearchQuery('');
    setMaxPriceInr(50000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-28 pb-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block mb-2">
            🇮🇳 India-First & Global Collection
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-stone-100 mb-4">
            {t('catalog.title')}
          </h1>
          <p className="text-stone-400 text-sm max-w-2xl font-light">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="p-6 rounded-3xl bg-stone-900/75 border border-stone-850 backdrop-blur-xl mb-12 shadow-2xl space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-stone-800">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
                  selectedCategory === c.value
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                    : 'bg-stone-950/80 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Destination Dropdowns: Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Country */}
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block mb-1">
                {t('catalog.filterCountry')}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('all');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="all">{t('search.allCountries')}</option>
                <option value="IN">🇮🇳 India (भारत)</option>
                <option value="AE">🇦🇪 United Arab Emirates</option>
                <option value="FR">🇫🇷 France</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="ID">🇮🇩 Indonesia</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">
                {t('catalog.filterCity')}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="all">{t('search.allCities')}</option>
                {currentCities.map((c) => (
                  <option key={c} value={c}>
                    {c} {c === 'Indore' ? '(Featured City)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Capacity */}
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">
                {t('catalog.anyCapacity')}
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="">{t('catalog.anyCapacity')}</option>
                <option value="2">2+ Guests</option>
                <option value="4">4+ Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">
                Keyword
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('catalog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* Price Slider & Reset Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <div className="w-full sm:w-80">
              <div className="flex justify-between text-xs font-mono text-stone-400 mb-1">
                <span>{t('catalog.maxPrice')}</span>
                <span className="text-amber-400 font-medium">
                  {formatCurrency(maxPriceInr, 'INR')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={maxPriceInr}
                onChange={(e) => setMaxPriceInr(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('catalog.resetFilters')}</span>
            </button>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-stone-900/60 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24 bg-stone-900/30 rounded-3xl border border-stone-850 px-6">
            <SlidersHorizontal className="w-8 h-8 text-stone-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-200">{t('catalog.noResultsTitle')}</h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">{t('catalog.noResultsDesc')}</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-full bg-amber-500 text-stone-950 font-medium text-xs uppercase tracking-wider"
            >
              {t('catalog.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => {
              const { formatted, isConverted } = displayPriceWithEstimate(
                room.pricePerNight,
                room.currency || 'INR',
                currency
              );

              return (
                <div
                  key={room._id}
                  className="group rounded-3xl overflow-hidden bg-stone-900/80 border border-stone-850 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Image banner */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={room.coverImage}
                        alt={room.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Location Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md bg-stone-950/75 border border-stone-800 text-[11px] font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {room.city}, {room.countryCode}
                      </div>

                      {room.hotspotMeta?.heroFeatured && (
                        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full backdrop-blur-md bg-amber-500/90 text-stone-950 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {t('catalog.featuredTag')}
                        </div>
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-6">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="text-lg font-normal text-stone-100 group-hover:text-amber-400 transition-colors">
                          {room.title}
                        </h3>
                        <div className="text-right">
                          <span className="text-base font-semibold text-stone-100 font-mono">
                            {formatted}
                          </span>
                          <span className="text-[10px] text-stone-500 block">/ night</span>
                          {isConverted && (
                            <span className="text-[9px] text-amber-400 font-mono block">
                              (est.)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">
                        {room.tagline}
                      </p>

                      {/* Amenities Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {room.amenities.slice(0, 3).map((a, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-950/90 border border-stone-800 text-[10px] text-stone-400"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer specs & CTA */}
                  <div className="px-6 pb-6 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Users className="w-3.5 h-3.5 text-stone-500" /> {t('home.upToGuests', { count: room.maxGuests })}
                    </span>

                    <button
                      onClick={() => navigate(`/rooms/${room.slug}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs text-stone-200 font-medium transition-all group-hover:bg-amber-500 group-hover:text-stone-950"
                    >
                      <span>{t('catalog.viewStay')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
