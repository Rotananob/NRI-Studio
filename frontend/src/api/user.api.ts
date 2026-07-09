import apiClient from './axiosClient';
import { User } from '../types/user.types';

export const userApi = {
  sync: async (data: { displayName?: string; avatar?: string }): Promise<User> => {
    const res = await apiClient.post('/auth/sync', data);
    return res.data.user;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { displayName?: string; avatar?: string }): Promise<void> => {
    await apiClient.patch('/user/profile', data);
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/user/account');
  },
};
