import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookingsPage } from './pages/BookingsPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Compass, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center text-center px-6 pt-24">
    <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500 mb-6">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <span className="text-xs uppercase font-mono tracking-[0.25em] text-amber-500 mb-2">
      404 - Sanctuary Not Located
    </span>
    <h1 className="text-4xl sm:text-5xl font-light text-stone-100 mb-4">
      The Path Has Dissolved in the Mist
    </h1>
    <p className="text-stone-400 text-sm max-w-md font-light mb-8">
      The requested destination or reservation pass does not exist or has been relocated.
    </p>
    <Link
      to="/"
      className="px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-medium text-xs tracking-wider uppercase inline-flex items-center gap-2"
    >
      <Compass className="w-4 h-4" />
      Return to HotelPro Collection
    </Link>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/rooms/:slug" element={<RoomDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingDetailPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/rooms" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminDashboard />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
}
