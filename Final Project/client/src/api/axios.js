import axios from 'axios';

// Uses VITE_API_BASE_URL if configured, otherwise falls back to Vite dev proxy
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('km_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
