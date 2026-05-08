import { api } from './api';

export const userService = {
  getProfile: async () => {
    return api.get('/api/user/profile');
  },
  
  updateProfile: async (data: { name: string; email: string; phone?: string; organization?: string }) => {
    return api.put('/api/user/profile', data);
  },
  
  changePassword: async (data: any) => {
    return api.put('/api/user/change-password', data);
  }
};
