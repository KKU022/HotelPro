import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hotel, KeyRound, Mail, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const isSecretMistake = rawClientId?.startsWith('GOCSPX-');
  const isConfigured = !!rawClientId && !isSecretMistake && !rawClientId.includes('your_google_client_id');

  useEffect(() => {
    if (!isConfigured || !rawClientId) return;

    const setupGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: rawClientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                setLoading(true);
                setError('');
                try {
                  await loginWithGoogle(response.credential);
                  navigate('/rooms');
                } catch (err: any) {
                  setError(err.message || 'Google authentication failed');
                } finally {
                  setLoading(false);
                }
              }
            },
          });

          const btnContainer = document.getElementById('googleSignInBtn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill',
            });
          }
          setGoogleReady(true);
        } catch (e: any) {
          console.error('Failed to initialize Google Auth', e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      setupGoogle();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          setupGoogle();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isConfigured, rawClientId, loginWithGoogle, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/rooms');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@hotelpro.luxury');
    setPassword('HotelPro@Admin2026!');
    setError('');
  };

  const fillCustomer = () => {
    setEmail('alexander@example.com');
    setPassword('GuestPass2026!');
    setError('');
  };

  const handleGoogleClick = () => {
    if (isSecretMistake) {
      setError("⚠️ Google Client Secret detected: In client/.env, the value starts with 'GOCSPX-', which is your Client Secret. Please replace it with your Client ID (which ends with '.apps.googleusercontent.com').");
      return;
    }
    if (!isConfigured) {
      setError("Google Sign-In is blocked pending configuration. Set VITE_GOOGLE_CLIENT_ID in client/.env and GOOGLE_CLIENT_ID in server/.env.");
      return;
    }
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.prompt();
    } else {
      setError("Loading Google Identity Services... please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-6 py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(180,120,60,0.1),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md backdrop-blur-2xl bg-stone-900/90 border border-stone-800/90 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold mx-auto mb-4 shadow-lg shadow-amber-950/40">
            <Hotel className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-amber-500 block mb-1">
            Guest & Staff Portal
          </span>
          <h2 className="text-3xl font-light text-stone-100 tracking-tight">
            Welcome to HotelPro
          </h2>
          <p className="text-xs text-stone-400 mt-2 font-light">
            Sign in to access your sanctuary reservations and preferences.
          </p>
        </div>

        {/* Demo Credentials Quick Fill Buttons */}
        <div className="mb-6 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 block mb-2.5">
            Quick Evaluation Access (Viva Demo)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillAdmin}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-500" />
              Demo Guest
            </button>
          </div>
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
              Password
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-medium text-xs tracking-wider uppercase transition-all shadow-xl shadow-amber-950/40 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In to HotelPro'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-800" />
          </div>
          <span className="relative bg-stone-900 px-3 text-[10px] font-mono uppercase tracking-widest text-stone-500">
            Or Authenticate Via
          </span>
        </div>

        {/* Google OAuth Section */}
        <div className="flex flex-col items-center justify-center min-h-[48px]">
          <div id="googleSignInBtn" className={googleReady ? 'flex justify-center w-full' : 'hidden'} />

          {!googleReady && (
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3 px-4 rounded-full bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium flex items-center justify-center gap-3 transition-colors shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
          Do not have an account yet?{' '}
          <Link to="/register" className="text-amber-400 hover:underline font-medium">
            Create Customer Profile
          </Link>
        </div>
      </div>
    </div>
  );
};
