import { api } from './api';

export const authService = {
  login: async (data: { email: string; password: string }) => {
    // Returns: { token, user: { id, name, email, role } }
    return api.post('/api/auth/login', data);
  },

  register: async (data: { name: string; email: string; password: string }) => {
    // Returns: { message, user_id }
    return api.post('/api/auth/register', data);
  },

  forgotPassword: async (data: { email: string }) => {
    // Returns: { message }
    // NOTE: Backend logs the code to the server console (no real email yet)
    return api.post('/api/auth/forgot-password', data);
  },

  verifyCode: async (data: { email: string; code: string }) => {
    // Returns: { message: "Code verified successfully" }
    return api.post('/api/auth/verify-code', data);
  },

  resetPassword: async (data: { email: string; code: string; new_password: string }) => {
    // Returns: { message: "Password updated successfully" }
    return api.post('/api/auth/reset-password', data);
  },

  // Token management
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  // User info management
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('auth_user');
      if (u) {
        try { return JSON.parse(u); } catch { return null; }
      }
    }
    return null;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }
};
