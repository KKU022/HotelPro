import { apiRequest } from './api';
import type { User } from './types';

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return apiRequest<{ user: User }>('/auth/me');
  },
};
