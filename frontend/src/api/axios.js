// src/api/axios.js
// Configured Axios instance — auto-attaches JWT, handles 401 globally

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach Bearer token ───────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wa_token');
      localStorage.removeItem('wa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
