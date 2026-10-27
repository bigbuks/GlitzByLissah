import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// Uses adminToken for /admin routes, regular token otherwise
// ==========================================
api.interceptors.request.use(
  (config) => {
    // ✅ Check if this is an admin route
    const isAdminRoute = config.url?.includes('/admin');

    // ✅ Use the appropriate token
    const token = isAdminRoute
      ? localStorage.getItem('adminToken')
      : localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handles 401 by clearing the appropriate token
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ Determine which session to clear
      const isAdminRoute = error.config?.url?.includes('/admin');

      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;