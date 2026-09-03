// frontend/src/features/ratna/services/ratnaService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse } from '../../../core/types';

export interface RatnaLedgerEntry {
  id: string;
  event: string;
  ratna: number;
  complaintId?: string | null;
  note?: string | null;
  createdAt: string;
  complaint?: {
    id: string;
    category: string;
    address?: string | null;
  } | null;
}

export interface CouponItem {
  id: string;
  code: string;
  value: number;
  partner: string;
  ratnaSpent: number;
  expiresAt: string;
  createdAt: string;
}

export interface RatnaStats {
  total: number;
  tierName: string;
  tierLevel: number;
  nextTierPoints: number;
  history: RatnaLedgerEntry[];
  coupons: CouponItem[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  ratnaTotal: number;
  jurisdiction?: string | null;
  createdAt: string;
  _count?: {
    complaints: number;
  };
}

export const ratnaService = {
  getMyStats: async () => {
    const res = await api.get<ApiResponse<RatnaStats>>('/ratna/me');
    return res.data;
  },

  getLeaderboard: async (params?: { scope?: 'city' | 'ward'; ward?: string; limit?: number }) => {
    const res = await api.get<ApiResponse<LeaderboardUser[]>>('/ratna/leaderboard', { params });
    return res.data;
  },

  redeemCoupon: async (payload: { ratnaCost: number; partner: string; value: number }) => {
    const res = await api.post<ApiResponse<CouponItem>>('/ratna/redeem', payload);
    return res.data;
  },
};
