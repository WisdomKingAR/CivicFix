// frontend/src/features/auth/services/authService.ts
import { api, setAccessToken } from '../../../core/api/client';
import type { ApiResponse, LoginResponseData, User } from '../../../core/types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'CITIZEN' | 'AUTHORITY';
    jurisdiction?: string;
  }) => {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/register', payload);
    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout');
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
    }
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/user/me');
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },
};
