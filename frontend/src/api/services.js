// src/api/services.js
// Centralized API calls for all backend endpoints

import api from './axios';

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  googleLogin: (data) => api.post('/auth/google', data),
};

// ── Work Logs ─────────────────────────────────────────────
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getOne: (id) => api.get(`/logs/${id}`),
  getStats: (params) => api.get('/logs/stats', { params }),
  create: (formData) =>
    api.post('/logs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/logs/${id}`, data),
  delete: (id) => api.delete(`/logs/${id}`),
  summarize: (id) => api.post(`/logs/${id}/summarize`),
};

// ── Users ─────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
  getTeamOverview: () => api.get('/users/team-overview'),
};

// ── AI Reports ────────────────────────────────────────────
export const reportsAPI = {
  generate: (data) => api.post('/reports/generate', data),
  getAll: (params) => api.get('/reports', { params }),
  getOne: (id) => api.get(`/reports/${id}`),
  delete: (id) => api.delete(`/reports/${id}`),
};
