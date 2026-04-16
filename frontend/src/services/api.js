// src/services/api.js
// Central axios instance — all API calls go through here

import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API calls ────────────────────────────────────────
export const authAPI = {
  signup: (name, email, password) =>
    api.post('/api/signup', { name, email, password }),

  login: (email, password) =>
    api.post('/api/login', { email, password }),
};

// ── Token helpers ─────────────────────────────────────────
export const tokenHelper = {
  save:   (token) => localStorage.setItem('access_token', token),
  get:    ()      => localStorage.getItem('access_token'),
  remove: ()      => localStorage.removeItem('access_token'),
  exists: ()      => !!localStorage.getItem('access_token'),
};

export default api;
