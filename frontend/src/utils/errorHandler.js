// Centralized error handling utilities for frontend

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message || 'An error occurred';

    switch (status) {
      case 400:
        return { message: `Invalid request: ${message}`, type: 'error' };
      case 401:
        return { message: 'Authentication required. Please log in again.', type: 'error' };
      case 403:
        return { message: 'Access denied. You do not have permission.', type: 'error' };
      case 404:
        return { message: 'Resource not found.', type: 'error' };
      case 409:
        return { message: `Conflict: ${message}`, type: 'error' };
      case 500:
        return { message: 'Server error. Please try again later.', type: 'error' };
      default:
        return { message: `Error: ${message}`, type: 'error' };
    }
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'error'
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'error'
    };
  }
};

export const withErrorHandling = async (fn, errorCallback) => {
  try {
    return await fn();
  } catch (error) {
    const errorInfo = handleAPIError(error);
    if (errorCallback) {
      errorCallback(errorInfo);
    }
    throw error;
  }
};

export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context}:`, error);
  }
  // In production, you could send to error tracking service like Sentry
};
