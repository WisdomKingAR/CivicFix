// frontend/src/features/analytics/services/analyticsService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse } from '../../../core/types';

export const analyticsService = {
  getCityAnalytics: async (params?: { category?: string; district?: string }) => {
    const res = await api.get<ApiResponse<any>>('/admin/analytics', { params });
    return res.data;
  },
};
