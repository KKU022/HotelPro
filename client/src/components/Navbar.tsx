import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, Compass, CalendarCheck, Shield, LogOut, LogIn, Menu, X, User as UserIcon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('hotelpro_lang', nextLang);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-md bg-stone-950/75 border border-stone-800/80 rounded-full px-5 py-2.5 shadow-2xl">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-900/30 group-hover:scale-105 transition-transform">
            <Hotel className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-light tracking-[0.2em] uppercase text-stone-100">
              Hotel<span className="font-semibold text-amber-500">Pro</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-full transition-colors ${
              isActive('/')
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-300 hover:text-white hover:bg-stone-900/60'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/rooms"
            className={`px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-full transition-colors flex items-center gap-1.5 ${
              isActive('/rooms')
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-300 hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            {t('nav.discoverStays')}
          </Link>
          {isAuthenticated && (
            <Link
              to="/bookings"
              className={`px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-full transition-colors flex items-center gap-1.5 ${
                isActive('/bookings')
                  ? 'bg-stone-800 text-stone-100 font-medium'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900/60'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
              {t('nav.myStays')}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-full transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {t('nav.management')}
            </Link>
          )}
        </nav>

        {/* Right Actions: Currency Selector, Language Toggle, and Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Currency Selector */}
          <div className="flex items-center rounded-full bg-stone-900/90 border border-stone-800 px-2.5 py-1 text-xs">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-amber-400 font-mono text-xs focus:outline-none cursor-pointer pr-1"
              title="Select display currency"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-stone-900 text-stone-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher (EN / HI) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/90 hover:bg-stone-850 border border-stone-800 text-xs font-mono text-stone-300 transition-colors"
            title="Toggle Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{i18n.language === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* User Auth Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-3 py-1 pr-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-xs text-stone-300">
                <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[9px] text-amber-400 font-mono">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-900 rounded-full transition-colors"
                title={t('nav.signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-medium text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-900/20 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('nav.signIn')}
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-mono text-amber-400"
          >
            {i18n.language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto backdrop-blur-2xl bg-stone-950/95 border border-stone-800 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-stone-850">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-stone-900 text-amber-400 rounded px-2 py-1 text-xs border border-stone-800"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleLanguage}
              className="text-xs font-mono text-amber-400 px-2 py-1 bg-stone-900 border border-stone-800 rounded"
            >
              {i18n.language === 'hi' ? 'Switch to English' : 'हिन्दी में देखें'}
            </button>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm text-stone-200 hover:bg-stone-900 rounded-lg"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm text-stone-200 hover:bg-stone-900 rounded-lg flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            {t('nav.discoverStays')}
          </Link>
          {isAuthenticated && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-stone-200 hover:bg-stone-900 rounded-lg flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              {t('nav.myStays')}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-amber-400 hover:bg-stone-900 rounded-lg flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {t('nav.management')}
            </Link>
          )}

          <div className="pt-2 border-t border-stone-850">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-stone-400">{user?.name} ({user?.role})</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-medium"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-2 rounded-xl bg-amber-500 text-stone-950 font-medium text-xs tracking-wider uppercase"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
