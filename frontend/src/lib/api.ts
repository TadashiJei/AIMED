import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

export const analysis = {
  analyzeText: async (text: string) => {
    const response = await api.post('/analysis/text', { text });
    return response.data;
  },
  analyzeDocument: async (documentUrl: string) => {
    const response = await api.post('/analysis/document', { documentUrl });
    return response.data;
  },
  analyzeRealTime: async (metrics: any[]) => {
    const response = await api.post('/analysis/realtime', { metrics });
    return response.data;
  },
  analyzeHistorical: async (metrics: any[], timeframe?: string) => {
    const response = await api.post('/analysis/trends', { metrics, timeframe });
    return response.data;
  },
  getHistory: async (params?: any) => {
    const response = await api.get('/analysis/history', { params });
    return response.data;
  },
  generateReport: async (analysisIds: string[]) => {
    const response = await api.post('/analysis/report', { analysisIds });
    return response.data;
  },
};

export const records = {
  getAll: async () => {
    const response = await api.get('/records');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },
  create: async (recordData: any) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },
  update: async (id: string, recordData: any) => {
    const response = await api.put(`/records/${id}`, recordData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },
  share: async (id: string, userId: string) => {
    const response = await api.post(`/records/${id}/share`, { userId });
    return response.data;
  },
};

export default api;
