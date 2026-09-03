// frontend/src/api/client.ts
import axios from 'axios';
import type {
  ApiResponse,
  LoginResponseData,
  User,
  Complaint,
  ComplaintCluster,
  GeoJsonFeatureCollection,
} from '../types';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let memoryToken: string | null = localStorage.getItem('civicfix_token');

export const setAccessToken = (token: string | null) => {
  memoryToken = token;
  if (token) {
    localStorage.setItem('civicfix_token', token);
  } else {
    localStorage.removeItem('civicfix_token');
  }
};

export const getAccessToken = () => memoryToken;

api.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const authApi = {
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
};

export const complaintsApi = {
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
};

export const authorityApi = {
  getQueue: async (params?: { category?: string; status?: string }) => {
    const res = await api.get<ApiResponse<Complaint[]>>('/authority/queue', { params });
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

export const mapApi = {
  getGeoJsonFeed: async () => {
    const res = await api.get<ApiResponse<GeoJsonFeatureCollection>>('/map/complaints');
    return res.data;
  },
  getClusters: async () => {
    const res = await api.get<ApiResponse<ComplaintCluster[]>>('/clusters');
    return res.data;
  },
};

export const uploadApi = {
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

export const adminApi = {
  getUsers: async () => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users');
    return res.data;
  },
  updateUser: async (
    id: string,
    payload: { role?: string; isFlagged?: boolean; flagReason?: string; jurisdiction?: string }
  ) => {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, payload);
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get<ApiResponse<any>>('/admin/analytics');
    return res.data;
  },
  getSpamLogs: async () => {
    const res = await api.get<ApiResponse<any[]>>('/admin/spam');
    return res.data;
  },
};
