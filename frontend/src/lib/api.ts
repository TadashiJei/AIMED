import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response;
  },
  logout: () => {
    Cookies.remove('token');
    window.location.href = '/login';
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response;
  },
};

export const analysis = {
  analyzeText: async (text: string) => {
    const response = await api.post('/analysis/text', { text });
    return response;
  },
  analyzeDocument: async (documentUrl: string) => {
    const response = await api.post('/analysis/document', { documentUrl });
    return response;
  },
  analyzeRealTime: async (metrics: any[]) => {
    const response = await api.post('/analysis/realtime', { metrics });
    return response;
  },
  analyzeHistorical: async (metrics: any[], timeframe?: string) => {
    const response = await api.post('/analysis/historical', { metrics, timeframe });
    return response;
  },
  getHistory: async (params?: any) => {
    const response = await api.get('/analysis/history', { params });
    return response;
  },
  generateReport: async (analysisIds: string[]) => {
    const response = await api.post('/analysis/report', { analysisIds });
    return response;
  },
};

export const records = {
  getAll: async () => {
    const response = await api.get('/records');
    return response;
  },
  getById: async (id: string) => {
    const response = await api.get(`/records/${id}`);
    return response;
  },
  create: async (recordData: any) => {
    const response = await api.post('/records', recordData);
    return response;
  },
  update: async (id: string, recordData: any) => {
    const response = await api.put(`/records/${id}`, recordData);
    return response;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/records/${id}`);
    return response;
  },
  share: async (id: string, userId: string) => {
    const response = await api.post(`/records/${id}/share`, { userId });
    return response;
  },
};

export default api;
