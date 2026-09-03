// frontend/src/features/admin/services/adminService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse, User } from '../../../core/types';

export const adminService = {
  getUsers: async (params?: { role?: string; isFlagged?: boolean }) => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },

  updateUser: async (
    id: string,
    payload: { role?: string; isFlagged?: boolean; flagReason?: string; jurisdiction?: string }
  ) => {
    const res = await api.put<ApiResponse<User>>(`/admin/users/${id}`, payload);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get<ApiResponse<any>>('/admin/analytics');
    return res.data;
  },

  getSpamLogs: async () => {
    const res = await api.get<ApiResponse<any[]>>('/admin/spam-logs');
    return res.data;
  },
};
