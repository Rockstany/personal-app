import api from './api';

export const moneyService = {
  // Account APIs
  accounts: {
    create: (accountData) => api.post('/money/accounts', accountData),
    getAll: () => api.get('/money/accounts'),
    getById: (id) => api.get(`/money/accounts/${id}`),
    update: (id, updates) => api.patch(`/money/accounts/${id}`, updates),
    delete: (id) => api.delete(`/money/accounts/${id}`),
    getTotalBalance: () => api.get('/money/accounts/total-balance')
  },

  // Category APIs
  categories: {
    create: (categoryData) => api.post('/money/categories', categoryData),
    getAll: (type = null) => api.get('/money/categories', { params: { type } }),
    getById: (id) => api.get(`/money/categories/${id}`),
    update: (id, updates) => api.patch(`/money/categories/${id}`, updates),
    delete: (id) => api.delete(`/money/categories/${id}`),
    getStats: (startDate, endDate, type = null) =>
      api.get('/money/categories/stats', {
        params: { start_date: startDate, end_date: endDate, type }
      })
  },

  // Transaction APIs
  transactions: {
    create: (transactionData) => api.post('/money/transactions', transactionData),
    getAll: (filters = {}) => api.get('/money/transactions', { params: filters }),
    getById: (id) => api.get(`/money/transactions/${id}`),
    update: (id, updates) => api.patch(`/money/transactions/${id}`, updates),
    delete: (id) => api.delete(`/money/transactions/${id}`),
    getRecent: (limit = 10) => api.get('/money/transactions/recent', { params: { limit } }),
    getDailySummary: (date = null) =>
      api.get('/money/transactions/summary/daily', { params: { date } }),
    getPeriodSummary: (startDate, endDate) =>
      api.get('/money/transactions/summary/period', {
        params: { start_date: startDate, end_date: endDate }
      }),
    getMonthlyReport: (year = null, month = null) =>
      api.get('/money/transactions/reports/monthly', { params: { year, month } }),
    getDailyReport: (startDate, endDate) =>
      api.get('/money/transactions/reports/daily', {
        params: { start_date: startDate, end_date: endDate }
      })
  },

  // Transfer APIs
  transfers: {
    create: (transferData) => api.post('/money/transactions/transfers', transferData),
    getAll: (filters = {}) => api.get('/money/transactions/transfers', { params: filters }),
    delete: (id) => api.delete(`/money/transactions/transfers/${id}`)
  },

  // Recurring APIs
  recurring: {
    create: (recurringData) => api.post('/money/recurring', recurringData),
    getAll: (isActive = true) => api.get('/money/recurring', { params: { is_active: isActive } }),
    getById: (id) => api.get(`/money/recurring/${id}`),
    update: (id, updates) => api.patch(`/money/recurring/${id}`, updates),
    delete: (id) => api.delete(`/money/recurring/${id}`),
    getDue: () => api.get('/money/recurring/due'),
    process: (id) => api.post(`/money/recurring/${id}/process`),
    getReminders: () => api.get('/money/recurring/reminders')
  }
};
