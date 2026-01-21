import axios from 'axios';

// Use a separate axios instance to avoid circular dependency with api.js interceptors
const monitoringApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

class MonitoringService {
  constructor() {
    this.metrics = {
      pageViews: [],
      apiCalls: [],
      errors: [],
      performance: []
    };
    this.currentPage = null;
    this.pageStartTime = null;
  }

  // Track page view
  trackPageView(pageName) {
    const now = Date.now();

    // Save previous page duration
    if (this.currentPage && this.pageStartTime) {
      const duration = now - this.pageStartTime;
      this.metrics.pageViews.push({
        page: this.currentPage,
        timestamp: this.pageStartTime,
        duration,
        date: new Date(this.pageStartTime).toISOString()
      });
    }

    // Start tracking new page
    this.currentPage = pageName;
    this.pageStartTime = now;

    // Log to backend
    this.logToBackend('page_view', {
      page: pageName,
      timestamp: now
    });
  }

  // Track API call performance
  trackAPICall(endpoint, duration, success = true, error = null) {
    const metric = {
      endpoint,
      duration,
      success,
      error: error?.message,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    this.metrics.apiCalls.push(metric);

    // Log slow API calls (> 2 seconds)
    if (duration > 2000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
      this.logToBackend('slow_api', metric);
    }

    // Log failed API calls
    if (!success) {
      this.metrics.errors.push({
        type: 'api_error',
        endpoint,
        error: error?.message,
        timestamp: Date.now()
      });
      this.logToBackend('api_error', metric);
    }
  }

  // Track general errors
  trackError(error, context = '') {
    const errorLog = {
      message: error?.message || String(error),
      stack: error?.stack,
      context,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      page: this.currentPage
    };

    this.metrics.errors.push(errorLog);
    this.logToBackend('error', errorLog);
  }

  // Track component render performance
  trackPerformance(componentName, duration) {
    const metric = {
      component: componentName,
      duration,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    this.metrics.performance.push(metric);

    // Log slow renders (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow render detected: ${componentName} took ${duration}ms`);
      this.logToBackend('slow_render', metric);
    }
  }

  // Get current system status
  getStatus() {
    const recentApiCalls = this.metrics.apiCalls.slice(-10);
    const recentErrors = this.metrics.errors.slice(-5);
    const avgApiTime = recentApiCalls.length > 0
      ? recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length
      : 0;

    const failedCalls = recentApiCalls.filter(call => !call.success).length;
    const errorCount = recentErrors.length;

    let status = 'operational';
    let message = 'All systems operational';

    if (errorCount > 3 || failedCalls > 5) {
      status = 'major_outage';
      message = 'Multiple errors detected';
    } else if (errorCount > 1 || failedCalls > 2 || avgApiTime > 3000) {
      status = 'degraded';
      message = 'Performance issues detected';
    } else if (avgApiTime > 2000) {
      status = 'minor_issues';
      message = 'Slight delays detected';
    }

    return {
      status,
      message,
      avgResponseTime: Math.round(avgApiTime),
      errorCount,
      failedCallsCount: failedCalls,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get metrics summary
  getMetrics() {
    return {
      pageViews: this.metrics.pageViews.length,
      apiCalls: this.metrics.apiCalls.length,
      errors: this.metrics.errors.length,
      avgApiTime: this.metrics.apiCalls.length > 0
        ? Math.round(this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls.length)
        : 0,
      recentPageViews: this.metrics.pageViews.slice(-10),
      recentErrors: this.metrics.errors.slice(-5)
    };
  }

  // Log to backend (async, non-blocking)
  async logToBackend(type, data) {
    try {
      // Use separate axios instance to avoid triggering api.js interceptors (infinite loop)
      monitoringApi.post('/monitoring/log', {
        type,
        data,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Clear old metrics (keep last 100 entries)
  clearOldMetrics() {
    const maxEntries = 100;
    if (this.metrics.pageViews.length > maxEntries) {
      this.metrics.pageViews = this.metrics.pageViews.slice(-maxEntries);
    }
    if (this.metrics.apiCalls.length > maxEntries) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-maxEntries);
    }
    if (this.metrics.errors.length > maxEntries) {
      this.metrics.errors = this.metrics.errors.slice(-maxEntries);
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Auto-cleanup every 5 minutes
setInterval(() => {
  monitoringService.clearOldMetrics();
}, 5 * 60 * 1000);

// Track global errors
window.addEventListener('error', (event) => {
  monitoringService.trackError(event.error, 'global_error_handler');
});

window.addEventListener('unhandledrejection', (event) => {
  monitoringService.trackError(event.reason, 'unhandled_promise_rejection');
});
