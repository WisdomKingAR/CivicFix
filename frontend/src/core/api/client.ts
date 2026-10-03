// frontend/src/core/api/client.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = 'civicfix_access_token';
const REFRESH_TOKEN_KEY = 'civicfix_refresh_token';

let memoryToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const setAccessToken = (token: string | null) => {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
};

export const getAccessToken = () => {
  if (!memoryToken && typeof window !== 'undefined') {
    memoryToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return memoryToken;
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

export const getRefreshToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh on 401 for non-auth requests
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(new Error('Session expired'), null);
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('civicfix_user');
        }
      } finally {
        isRefreshing = false;
      }
    }

    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);
