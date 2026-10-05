import { getAuthToken, setAuthToken } from '@/utils/tokenStorage';
import axios from 'axios';
import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;
const API_URL = envUrl
  ? Platform.OS === 'android'
    ? envUrl.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2')
    : envUrl
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/v1'
    : 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// En web cross-site la cookie SameSite=Lax no viaja en XHR → Bearer como fallback.
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await getAuthToken();
        const res = await refreshClient.post<{ token?: string }>(
          '/auth/refresh',
          null,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        if (res.data?.token) setAuthToken(res.data.token);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
