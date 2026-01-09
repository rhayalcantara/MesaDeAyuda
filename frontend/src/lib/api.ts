import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

// For unified IIS deployment, use relative URL '/api'
// For development, use full URL 'http://localhost:5000/api'
const getApiUrl = (): string => {
  // In browser, detect environment based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // If running locally (localhost or 127.0.0.1), use localhost API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Use environment variable if set, otherwise default localhost
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }

    // In production (any non-localhost hostname), ALWAYS use relative path
    // This ensures API calls go to the same server, avoiding CORS issues
    return '/api';
  }

  // Server-side rendering fallback (shouldn't happen with static export)
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

const API_URL = getApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Only redirect if not already on login page to avoid infinite loop
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/solicitar-registro')) {
            window.location.href = '/login';
          }
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden:', data?.message);
      }

      // Handle validation errors
      if (status === 400 && data?.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        error.message = errorMessages || data.message || 'Error de validacion';
      }
    } else if (error.request) {
      // Network error
      error.message = 'Error de conexion. Verifica tu conexion a internet.';
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function for file uploads
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData?: Record<string, string | number>
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Helper function for file downloads
export const downloadFile = async (endpoint: string, filename: string): Promise<void> => {
  const response = await api.get(endpoint, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
