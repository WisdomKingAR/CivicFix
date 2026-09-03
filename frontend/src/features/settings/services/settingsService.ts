// frontend/src/features/settings/services/settingsService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse, User } from '../../../core/types';

export const settingsService = {
  updateProfile: async (payload: { name?: string; phone?: string; jurisdiction?: string }) => {
    const res = await api.patch<ApiResponse<User>>('/user/me', payload);
    return res.data;
  },
};
