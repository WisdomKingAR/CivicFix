// frontend/src/core/api/client.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
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
