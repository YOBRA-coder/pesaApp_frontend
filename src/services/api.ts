import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1', // Your ngrok URL
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (refreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      refreshing = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
          { refreshToken }
        );
        const newToken = data.data.accessToken;
        useAuthStore.getState().setTokens(newToken, data.data.refreshToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const apiGet = <T>(url: string, params?: object) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data.data);

export const apiPost = <T>(url: string, data?: object | FormData) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, data).then((r) => r.data);

export const apiPatch = <T>(url: string, data?: object) =>
  api.patch<{ success: boolean; data: T }>(url, data).then((r) => r.data.data);
