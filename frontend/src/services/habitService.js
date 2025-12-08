import api from './api';

export const habitService = {
  create: (habitData) => api.post('/habits', habitData),
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  update: (id, updates) => api.patch(`/habits/${id}`, updates),
  delete: (id, reason) => api.delete(`/habits/${id}`, { data: { reason } }),
  complete: (id, status, value, skipDayId) => api.post(`/habits/${id}/complete`, { status, value, skipDayId }),
  syncCompletion: (id, data) => api.post(`/habits/${id}/completions/sync`, data),
  getCalendar: (id, month) => api.get(`/habits/${id}/calendar/${month}`),
  getSkipDays: (id) => api.get(`/habits/${id}/skip-days`)
};
