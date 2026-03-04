import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors on protected routes (not on login itself)
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Patients API
export const patientsAPI = {
  search: (code?: string, page = 1, limit = 10) =>
    api.get('/patients/search', { params: { code, page, limit } }),
  getByCode: (code: string) => api.get(`/patients/code/${code}`),
  getById: (id: number) => api.get(`/patients/${id}`),
  getMyPatients: (page = 1, limit = 10) =>
    api.get('/patients/my-patients', { params: { page, limit } }),
  createDischargeProfile: (data: {
    diagnosisSummary: string;
    treatmentSummary: string;
    expectedSideEffects?: string;
    warningSigns: string;
    followUpInstructions: string;
    dischargeDate: string;
    specialty: string;
    patientPhone?: string;
  }) => api.post('/patients/discharge', data),
};

// Consultations API
export const consultationsAPI = {
  getAll: (params?: { status?: string; urgency?: string; page?: number; limit?: number }) =>
    api.get('/consultations', { params }),
  getById: (id: number) => api.get(`/consultations/${id}`),
  getStats: () => api.get('/consultations/stats'),
  create: (data: {
    patientId: number;
    symptoms: string[];
    symptomDescription?: string;
    vitalSigns: {
      temperature?: number;
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      pulseRate?: number;
      respiratoryRate?: number;
    };
    clinicalQuestion: string;
    urgencyLevel: string;
  }) => api.post('/consultations', data),
  respond: (id: number, data: {
    carePathway: string;
    recommendations: string;
    medicationInstructions?: string;
    followUpTimeframe?: string;
  }) => api.put(`/consultations/${id}/respond`, data),
  close: (id: number) => api.put(`/consultations/${id}/close`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  // Users
  getUsers: (params?: { role?: string; facilityId?: number; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    facilityId: number;
    specialty?: string;
    phone?: string;
  }) => api.post('/admin/users', data),
  updateUser: (id: number, data: Partial<{
    firstName: string;
    lastName: string;
    role: string;
    facilityId: number;
    specialty: string;
    phone: string;
    isActive: boolean;
  }>) => api.put(`/admin/users/${id}`, data),
  toggleUserStatus: (id: number) => api.patch(`/admin/users/${id}/toggle-status`),

  // Facilities
  getFacilities: (params?: { type?: string; district?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/facilities', { params }),
  createFacility: (data: {
    name: string;
    type: string;
    district: string;
    province: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => api.post('/admin/facilities', data),
  updateFacility: (id: number, data: Partial<{
    name: string;
    type: string;
    district: string;
    province: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
  }>) => api.put(`/admin/facilities/${id}`, data),

  // Analytics
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/analytics', { params }),
};

export default api;
