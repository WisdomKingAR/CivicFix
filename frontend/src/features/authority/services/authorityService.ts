// frontend/src/features/authority/services/authorityService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse, Complaint, User } from '../../../core/types';

export const authorityService = {
  getQueue: async (params?: { category?: string; status?: string }) => {
    const res = await api.get<ApiResponse<Complaint[]>>('/authority/queue', { params });
    return res.data;
  },

  getStaff: async () => {
    const res = await api.get<ApiResponse<User[]>>('/authority/staff');
    return res.data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await api.put<ApiResponse<Complaint>>(`/authority/complaints/${id}/status`, {
      status,
      notes,
    });
    return res.data;
  },

  assignStaff: async (id: string, assignedToId: string, notes?: string) => {
    const res = await api.post<ApiResponse<any>>(`/authority/complaints/${id}/assign`, {
      assignedToId,
      notes,
    });
    return res.data;
  },

  resolveComplaint: async (id: string, afterPhotoUrl: string, notes?: string) => {
    const res = await api.post<ApiResponse<{ complaint: Complaint; aiVerification: any }>>(
      `/authority/complaints/${id}/resolve`,
      { afterPhotoUrl, notes }
    );
    return res.data;
  },
};
