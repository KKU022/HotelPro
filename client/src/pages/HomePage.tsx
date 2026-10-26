import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Bed, Users, Trees, Waves, Mountain, Flame, ShieldCheck, Compass, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { roomsService } from '../services/roomsService';
import type { Room, DestinationTaxonomy } from '../services/types';
import { FloatingHotspot } from '../components/FloatingHotspot';
import { useCurrency } from '../context/CurrencyContext';
import { displayPriceWithEstimate } from '../utils/formatters';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [destinations, setDestinations] = useState<DestinationTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State (India-first, Indore default)
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  const [selectedCity, setSelectedCity] = useState<string>('Indore');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [roomsRes, destRes] = await Promise.all([
          roomsService.getFeaturedRooms(),
          roomsService.getDestinations(),
        ]);
        setFeaturedRooms(roomsRes.rooms);
        setDestinations(destRes.destinations);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter cities for selected country
  const currentCities = React.useMemo(() => {
    if (!selectedCountry || selectedCountry === 'all') {
      return Array.from(new Set(destinations.flatMap((d) => d.cities))).sort();
    }
    const found = destinations.find((d) => d.countryCode === selectedCountry);
    return found ? found.cities : [];
  }, [destinations, selectedCountry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCountry && selectedCountry !== 'all') params.set('countryCode', selectedCountry);
    if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* SECTION 2: CINEMATIC HERO */}
      <section className="relative min-h-[92vh] flex flex-col justify-end px-6 sm:px-12 pb-24 pt-32 overflow-hidden">
        {/* Edge-to-Edge Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="HotelPro Sanctuary Retreat"
            className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
          />
          {/* Subtle editorial radial and linear dark gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(180,120,60,0.18),transparent_60%)]" />
        </div>

        {/* Pinned Interactive Hotspots */}
        {featuredRooms.map((room) => (
          <FloatingHotspot key={room._id} room={room} />
        ))}

        {/* Hero Editorial Typography */}
        <div className="relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900/80 border border-amber-500/30 text-amber-400 text-xs tracking-[0.25em] uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-stone-100 leading-[1.05] mb-6">
            {t('hero.titlePart1')}{' '}
            <span className="font-serif italic font-normal text-amber-400">
              {t('hero.titlePart2')}
            </span>
          </h1>

          <p className="text-stone-300 text-base sm:text-xl font-light max-w-2xl leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* SECTION 3: GEOGRAPHICALLY AWARE SEARCH BAR (INDIA-FIRST & GLOBAL) */}
        <div className="relative z-20 max-w-6xl w-full">
          <form
            onSubmit={handleSearch}
            className="backdrop-blur-xl bg-stone-900/95 border border-stone-800/90 rounded-2xl sm:rounded-full p-3 sm:p-2.5 shadow-2xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center"
          >
            {/* Country Selector (Defaults to India) */}
            <div className="px-3.5 py-2 flex flex-col">
              <label className="text-[10px] uppercase tracking-wider text-amber-400/90 font-mono flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-500" />
                {t('search.country')}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('all');
                }}
                className="bg-transparent text-xs sm:text-sm text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-stone-900 text-stone-100">{t('search.allCountries')}</option>
                <option value="IN" className="bg-stone-900 text-stone-100 font-medium">🇮🇳 India (भारत)</option>
                <option value="AE" className="bg-stone-900 text-stone-100">🇦🇪 United Arab Emirates</option>
                <option value="FR" className="bg-stone-900 text-stone-100">🇫🇷 France</option>
                <option value="GB" className="bg-stone-900 text-stone-100">🇬🇧 United Kingdom</option>
                <option value="ID" className="bg-stone-900 text-stone-100">🇮🇩 Indonesia</option>
              </select>
            </div>

            {/* City Selector (Defaults to Indore) */}
            <div className="px-3.5 py-2 border-t sm:border-t-0 sm:border-l border-stone-800 flex flex-col">
              <label className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                {t('search.city')}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-stone-900 text-stone-100">{t('search.allCities')}</option>
                {currentCities.map((c) => (
                  <option key={c} value={c} className="bg-stone-900 text-stone-100">
                    {c} {c === 'Indore' ? '(Featured City)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In */}
            <div className="px-3.5 py-2 border-t sm:border-t-0 sm:border-l border-stone-800 flex flex-col">
              <label className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                {t('search.checkIn')}
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-stone-100 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-Out */}
            <div className="px-3.5 py-2 border-t sm:border-t-0 sm:border-l border-stone-800 flex flex-col">
              <label className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                {t('search.checkOut')}
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-stone-100 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Guests & Search Button */}
            <div className="px-2 flex items-center justify-between gap-2 border-t sm:border-t-0 sm:border-l border-stone-800">
              <div className="flex flex-col pl-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                  {t('search.guests')}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-stone-100 focus:outline-none cursor-pointer"
                >
                  <option value="1" className="bg-stone-900">1</option>
                  <option value="2" className="bg-stone-900">2</option>
                  <option value="4" className="bg-stone-900">4</option>
                  <option value="6" className="bg-stone-900">6+</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-medium text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-lg shadow-amber-950/40"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('search.searchButton')}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 4: FEATURED STAYS (DATABASE-BACKED) */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block mb-3">
              {t('home.curatedHighlights')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-stone-100">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <button
            onClick={() => navigate('/rooms')}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors group"
          >
            <span>{t('home.exploreAll', { count: 12 })}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-stone-900/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => {
              const { formatted, isConverted } = displayPriceWithEstimate(
                room.pricePerNight,
                room.currency || 'INR',
                currency
              );

              return (
                <div
                  key={room._id}
                  onClick={() => navigate(`/rooms/${room.slug}`)}
                  className="group relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-850 hover:border-amber-500/40 transition-all duration-500 cursor-pointer shadow-xl"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={room.coverImage}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md bg-stone-950/75 border border-stone-800 text-[11px] font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {room.city}, {room.countryCode}
                    </div>
                    <div className="absolute bottom-4 right-4 px-3.5 py-1 rounded-full backdrop-blur-md bg-stone-950/85 text-xs font-medium text-stone-100 font-mono">
                      {formatted} <span className="text-[10px] text-stone-400 font-sans">{t('home.perNight')}</span>
                      {isConverted && <span className="text-[10px] text-amber-400 ml-1 font-sans">(est.)</span>}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-normal text-stone-100 mb-2 group-hover:text-amber-400 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">
                      {room.tagline}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 pt-3 border-t border-stone-800/80">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-400" /> {t('home.upToGuests', { count: room.maxGuests })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-stone-400" /> {room.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: INTERACTIVE SANCTUARY HIGHLIGHTS */}
      <section className="py-20 px-6 sm:px-12 bg-stone-900/40 border-y border-stone-850">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block">
              {t('home.ethosBadge')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-stone-100 leading-tight whitespace-pre-line">
              {t('home.ethosTitle')}
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed font-light">
              {t('home.ethosDesc')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800">
                <Flame className="w-6 h-6 text-amber-500 mb-3" />
                <h4 className="text-sm font-medium text-stone-200">{t('home.thermalTitle')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('home.thermalDesc')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800">
                <Mountain className="w-6 h-6 text-amber-500 mb-3" />
                <h4 className="text-sm font-medium text-stone-200">{t('home.seclusionTitle')}</h4>
                <p className="text-xs text-stone-500 mt-1">{t('home.seclusionDesc')}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                alt="Ahilya Courtyard Sanctuary"
                className="w-full h-[480px] object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl backdrop-blur-xl bg-stone-950/90 border border-stone-800 shadow-2xl max-w-xs">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest block mb-1">
                Featured: Indore, Madhya Pradesh
              </span>
              <p className="text-xs text-stone-300 font-light">
                Private heritage courtyards, fountain pools, and artisanal Malwa culinary service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ROOM CATEGORIES & CURATED COLLECTIONS */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block mb-3">
            Collections
          </span>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-stone-100 mb-4">
            Four Architectural Expressions
          </h2>
          <p className="text-stone-400 text-sm font-light">
            Filter by sanctuary topography across Indian destinations and international coasts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('categories.Chalet'), cat: 'Chalet', icon: Mountain, desc: 'Alpine lodges in Manali and pine ridges with thermal tubs.', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
            { title: t('categories.Villa'), cat: 'Villa', icon: Waves, desc: 'Ocean cliff villas in Goa and skyline waters in Dubai.', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
            { title: t('categories.Suite'), cat: 'Suite', icon: Bed, desc: 'Royal suites in Indore, Bhopal, and Paris courtyard salons.', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
            { title: t('categories.Cabin'), cat: 'Cabin', icon: Trees, desc: 'Backwater retreats in Kerala and river forest cabins in Bali.', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
          ].map((item) => (
            <div
              key={item.cat}
              onClick={() => navigate(`/rooms?category=${item.cat}`)}
              className="group relative rounded-2xl overflow-hidden border border-stone-850 hover:border-amber-500/50 cursor-pointer h-80 transition-all duration-300"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/65 to-transparent p-6 flex flex-col justify-end">
                <item.icon className="w-5 h-5 text-amber-400 mb-2" />
                <h3 className="text-lg font-medium text-stone-100 group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TRUST & SERVICE ASSURANCES */}
      <section className="py-20 px-6 sm:px-12 bg-stone-900/30 border-t border-stone-850">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-2xl bg-stone-950/80 border border-stone-800/80">
            <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-base font-medium text-stone-200 mb-2">{t('home.trust1Title')}</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('home.trust1Desc')}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-stone-950/80 border border-stone-800/80">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-base font-medium text-stone-200 mb-2">{t('home.trust2Title')}</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('home.trust2Desc')}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-stone-950/80 border border-stone-800/80">
            <Compass className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-base font-medium text-stone-200 mb-2">{t('home.trust3Title')}</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('home.trust3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: PROMINENT CALL TO ACTION */}
      <section className="py-28 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-amber-500 text-xs font-mono tracking-[0.25em] uppercase block mb-3">
            {t('home.ctaBadge')}
          </span>
          <h2 className="text-4xl sm:text-6xl font-light text-stone-100 tracking-tight mb-6">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-stone-400 text-base max-w-xl mx-auto leading-relaxed mb-10">
            {t('home.ctaDesc')}
          </p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-medium text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-950/50 inline-flex items-center gap-3"
          >
            <span>{t('home.ctaButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
