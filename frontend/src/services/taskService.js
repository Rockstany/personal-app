import api from './api';

export const taskService = {
  create: (taskData) => api.post('/tasks', taskData),
  getAll: (filter = 'today') => api.get(`/tasks?filter=${filter}`),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, updates) => api.patch(`/tasks/${id}`, updates),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  delete: (id, reason) => api.delete(`/tasks/${id}`, { data: { reason } })
};
