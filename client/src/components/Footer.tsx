import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Compass, ShieldCheck, Sparkles, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <footer className="bg-stone-950 border-t border-stone-850/80 text-stone-400 py-16 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand statement */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-900/30">
              <Hotel className="w-4 h-4" />
            </div>
            <span className="text-lg font-light tracking-[0.2em] uppercase text-stone-100">
              Hotel<span className="font-semibold text-amber-500">Pro</span>
            </span>
          </div>
          <p className="text-sm font-light text-stone-400 max-w-md leading-relaxed">
            {isHi
              ? 'इंदौर, उज्जैन, हिमालय और अंतरराष्ट्रीय तटीय स्थलों में निजी अभयारण्यों, हेरिटेज सुइट्स और अल्पाइन कॉटेज का एक विशिष्ट संग्रह, जो शांति, वास्तुशिल्प सौंदर्य और विश्राम के लिए बनाया गया है।'
              : 'A curated sanctuary collection of heritage courtyards in Indore, Himalayan stone chalets, and international cliffside villas designed for quiet reflection, architectural beauty, and restorative hospitality.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-amber-400 font-mono">
              <Sparkles className="w-3 h-3" /> {isHi ? 'प्रत्यक्ष बुकिंग गारंटी' : 'Direct Booking Guarantee'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" /> {isHi ? 'प्रमाणित अभयारण्य' : 'Verified Sanctuaries'}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-stone-200 font-medium mb-4">
            {isHi ? 'अभयारण्य अन्वेषण' : 'Explore Collections'}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/rooms" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-500" /> {isHi ? 'सभी अभयारण्य' : 'All Sanctuaries'}
              </Link>
            </li>
            <li>
              <Link to="/rooms?category=Suite" className="hover:text-amber-400 transition-colors">
                {isHi ? 'हेरिटेज व रॉयल सुइट्स' : 'Heritage & Royal Suites'}
              </Link>
            </li>
            <li>
              <Link to="/rooms?category=Chalet" className="hover:text-amber-400 transition-colors">
                {isHi ? 'अल्पाइन शैले' : 'Alpine Chalets'}
              </Link>
            </li>
            <li>
              <Link to="/rooms?category=Villa" className="hover:text-amber-400 transition-colors">
                {isHi ? 'तटीय व क्लिफसाइड विला' : 'Cliffside Ocean Villas'}
              </Link>
            </li>
            <li>
              <Link to="/rooms?category=Cabin" className="hover:text-amber-400 transition-colors">
                {isHi ? 'वुडलैंड व लेक केबिन' : 'Woodland & Lake Cabins'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Guest Portal */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-stone-200 font-medium mb-4">
            {isHi ? 'अतिथि अनुभव एवं द्वारपाल' : 'Guest Experience'}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/login" className="hover:text-amber-400 transition-colors">
                {isHi ? 'अतिथि साइन इन' : 'Customer Sign In'}
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-amber-400 transition-colors">
                {isHi ? 'मेरी बुकिंग्स' : 'My Reservations'}
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-amber-400 transition-colors">
                {isHi ? 'प्रशासन पोर्टल' : 'Staff & Admin Portal'}
              </Link>
            </li>
            <li className="pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1 text-stone-400 mb-0.5">
                <Phone className="w-3 h-3 text-amber-500" />
                {isHi ? 'इंदौर दरबान डेस्क:' : 'Indore Concierge Desk:'}
              </span>
              <span className="text-stone-300 font-mono text-[11px] block">+91 (0731) 425-7800</span>
              <span className="text-stone-500 font-mono text-[10px] block">Toll-Free: 1800-419-7800 (IST 9AM - 9PM)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
        <div>
          &copy; {new Date().getFullYear()} HotelPro Sanctuary Collection. B.Tech Computer Science Capstone System.
        </div>
        <div className="font-mono text-[11px] text-stone-400">
          MongoDB Atlas &bull; Express API &bull; React 19 &bull; Tailwind CSS v4 &bull; IST Asia/Kolkata
        </div>
      </div>
    </footer>
  );
};

