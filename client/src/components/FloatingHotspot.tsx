import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Room } from '../services/types';
import { useCurrency } from '../context/CurrencyContext';
import { displayPriceWithEstimate } from '../utils/formatters';

interface FloatingHotspotProps {
  room: Room;
}

export const FloatingHotspot: React.FC<FloatingHotspotProps> = ({ room }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { currency } = useCurrency();
  const { x, y } = room.hotspotMeta.pinPosition;

  const { formatted, isConverted } = displayPriceWithEstimate(
    room.pricePerNight,
    room.currency || 'INR',
    currency
  );

  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Center Pin Indicator */}
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group">
        <span className="absolute w-6 h-6 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
        <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-stone-950 shadow-lg group-hover:scale-125 transition-transform" />
      </div>

      {/* Floating Translucent Card */}
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-64 p-3 rounded-2xl backdrop-blur-xl bg-stone-950/85 border border-stone-800/80 shadow-2xl transition-all duration-300 pointer-events-auto ${
          isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-90 scale-95'
        }`}
      >
        <div className="flex gap-3 items-center">
          <img
            src={room.coverImage}
            alt={room.title}
            className="w-14 h-14 rounded-xl object-cover border border-stone-700/50"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
              {room.city}, {room.countryCode}
            </span>
            <h4 className="text-xs font-medium text-stone-100 truncate">{room.title}</h4>
            <span className="text-[11px] font-semibold text-stone-200 block font-mono mt-0.5">
              {formatted} <span className="text-[9px] text-stone-400 font-normal">/nt</span>
              {isConverted && <span className="text-[9px] text-amber-400 ml-1 font-sans">(est.)</span>}
            </span>
          </div>
        </div>

        <Link
          to={`/rooms/${room.slug}`}
          className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-[11px] text-stone-300 font-medium transition-colors group"
        >
          <span>Explore Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
