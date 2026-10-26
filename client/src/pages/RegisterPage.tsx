import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hotel, User, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/rooms');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-6 py-28 relative overflow-hidden">
      <div className="w-full max-w-md backdrop-blur-2xl bg-stone-900/90 border border-stone-800/90 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold mx-auto mb-4 shadow-lg shadow-amber-950/40">
            <Hotel className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-amber-500 block mb-1">
            Membership Enrollment
          </span>
          <h2 className="text-3xl font-light text-stone-100 tracking-tight">
            Create Guest Profile
          </h2>
          <p className="text-xs text-stone-400 mt-2 font-light">
            Unlock bespoke reservations and verified guest concierge service.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alexander Wright"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1.5">
              Password (Min 6 chars)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-medium text-xs tracking-wider uppercase transition-all shadow-xl shadow-amber-950/40 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
          Already have a member profile?{' '}
          <Link to="/login" className="text-amber-400 hover:underline font-medium">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
