import axios from 'axios';
import { monitoringService } from './monitoringService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Track request start time
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Track API call performance
    const duration = Date.now() - response.config.metadata.startTime;
    const endpoint = response.config.url;
    monitoringService.trackAPICall(endpoint, duration, true);
    return response;
  },
  (error) => {
    // Track failed API calls
    const duration = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : 0;
    const endpoint = error.config?.url || 'unknown';
    monitoringService.trackAPICall(endpoint, duration, false, error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
