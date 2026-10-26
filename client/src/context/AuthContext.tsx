import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../services/types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hotelpro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('hotelpro_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hotelpro_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('hotelpro_user', JSON.stringify(res.user));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('hotelpro_token');
          localStorage.removeItem('hotelpro_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('hotelpro_token', data.token);
    localStorage.setItem('hotelpro_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, pass: string) => {
    const data = await authService.register(name, email, pass);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('hotelpro_token', data.token);
    localStorage.setItem('hotelpro_user', JSON.stringify(data.user));
  };

  const loginWithGoogle = async (credential: string) => {
    const data = await authService.googleLogin(credential);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('hotelpro_token', data.token);
    localStorage.setItem('hotelpro_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hotelpro_token');
    localStorage.removeItem('hotelpro_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
