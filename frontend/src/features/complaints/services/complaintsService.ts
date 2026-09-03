// frontend/src/features/complaints/services/complaintsService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse, Complaint } from '../../../core/types';

export const complaintsService = {
  create: async (payload: {
    category: string;
    description: string;
    photoUrl: string;
    lat: number;
    lng: number;
    address?: string;
  }) => {
    const res = await api.post<ApiResponse<Complaint>>('/complaints', payload);
    return res.data;
  },

  getMyComplaints: async () => {
    const res = await api.get<ApiResponse<Complaint[]>>('/complaints');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return res.data;
  },

  confirmResolution: async (id: string, confirmed: boolean, feedback?: string) => {
    const res = await api.put<ApiResponse<Complaint>>(`/complaints/${id}/confirm-resolution`, {
      confirmed,
      feedback,
    });
    return res.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<ApiResponse<{ url: string; publicId: string }>>(
      '/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },
};
