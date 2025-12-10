import { useState, useEffect } from 'react';
import api from '../services/api';
import { monitoringService } from '../services/monitoringService';
import '../styles/SystemStatus.css';

function SystemStatus({ showToast }) {
  const [systemData, setSystemData] = useState(null);
  const [frontendMetrics, setFrontendMetrics] = useState(null);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemStatus();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadSystemStatus, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSystemStatus = async () => {
    try {
      // Load backend system status
      const response = await api.get('/system/status');
      setSystemData(response.data);

      // Load frontend monitoring metrics
      const metrics = monitoringService.getMetrics();
      const status = monitoringService.getStatus();
      setFrontendMetrics({ ...metrics, status });

      // Load cache status
      await loadCacheStatus();

      setLoading(false);
    } catch (error) {
      console.error('Error loading system status:', error);

      // Even if backend fails, show frontend metrics
      const metrics = monitoringService.getMetrics();
      const status = monitoringService.getStatus();
      setFrontendMetrics({ ...metrics, status });
      await loadCacheStatus();

      showToast('⚠️ Backend status unavailable', 'warning');
      setLoading(false);
    }
  };

  const loadCacheStatus = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheData = [];

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          cacheData.push({
            name: cacheName,
            count: keys.length,
            urls: keys.slice(0, 5).map(req => req.url) // First 5 URLs
          });
        }

        setCacheStatus({
          available: true,
          caches: cacheData,
          totalCaches: cacheNames.length,
          totalItems: cacheData.reduce((sum, c) => sum + c.count, 0)
        });
      } catch (error) {
        setCacheStatus({ available: false, error: error.message });
      }
    } else {
      setCacheStatus({ available: false, error: 'Cache API not supported' });
    }
  };

  const clearAllCaches = async () => {
    if (!confirm('Are you sure you want to clear all caches? This will reload the page.')) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      showToast('✅ All caches cleared!', 'success');
      window.location.reload();
    } catch (error) {
      showToast('❌ Failed to clear caches', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'disconnected':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = (bytes / 1024 / 1024).toFixed(2);
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <div className="system-status-container">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading system status...</p>
        </div>
      </div>
    );
  }

  if (!systemData) {
    return (
      <div className="system-status-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <p>Failed to load system status</p>
          <button onClick={loadSystemStatus} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="system-status-container">
      <div className="status-header">
        <div className="header-left">
          <h2 className="status-title">🖥️ System Status</h2>
          <p className="status-subtitle">Real-time monitoring dashboard</p>
        </div>
        <div className="header-right">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button onClick={loadSystemStatus} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overall System Health */}
      <div className="status-section">
        <h3 className="section-title">System Health</h3>
        <div className="health-cards">
          <div className={`health-card ${getStatusColor(systemData.server?.status)}`}>
            <div className="health-icon">🖥️</div>
            <div className="health-content">
              <div className="health-label">Server</div>
              <div className="health-status">{systemData.server?.status || 'Unknown'}</div>
            </div>
          </div>
          <div className={`health-card ${getStatusColor(systemData.database?.status)}`}>
            <div className="health-icon">💾</div>
            <div className="health-content">
              <div className="health-label">Database</div>
              <div className="health-status">{systemData.database?.status || 'Unknown'}</div>
            </div>
          </div>
          <div className={`health-card ${getStatusColor(systemData.api?.status)}`}>
            <div className="health-icon">🔌</div>
            <div className="health-content">
              <div className="health-label">API</div>
              <div className="health-status">{systemData.api?.status || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Metrics */}
      <div className="status-section">
        <h3 className="section-title">Server Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-content">
              <div className="metric-label">Uptime</div>
              <div className="metric-value">{formatUptime(systemData.server?.uptime)}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">💻</div>
            <div className="metric-content">
              <div className="metric-label">CPU Usage</div>
              <div className="metric-value">{systemData.server?.cpu || 'N/A'}%</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🧠</div>
            <div className="metric-content">
              <div className="metric-label">Memory Usage</div>
              <div className="metric-value">{formatBytes(systemData.server?.memory)}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Active Connections</div>
              <div className="metric-value">{systemData.server?.connections || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="status-section">
        <h3 className="section-title">Database Statistics</h3>
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-icon">👥</div>
            <div className="db-stat-content">
              <div className="db-stat-value">{systemData.database?.totalUsers || 0}</div>
              <div className="db-stat-label">Total Users</div>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">🎯</div>
            <div className="db-stat-content">
              <div className="db-stat-value">{systemData.database?.totalHabits || 0}</div>
              <div className="db-stat-label">Total Habits</div>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">✅</div>
            <div className="db-stat-content">
              <div className="db-stat-value">{systemData.database?.totalTasks || 0}</div>
              <div className="db-stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">📈</div>
            <div className="db-stat-content">
              <div className="db-stat-value">{systemData.database?.completions || 0}</div>
              <div className="db-stat-label">Completions</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="status-section">
        <h3 className="section-title">API Performance</h3>
        <div className="api-stats">
          <div className="api-stat">
            <span className="api-stat-label">Response Time (avg):</span>
            <span className="api-stat-value">{systemData.api?.avgResponseTime || 0}ms</span>
          </div>
          <div className="api-stat">
            <span className="api-stat-label">Requests (last hour):</span>
            <span className="api-stat-value">{systemData.api?.requestsLastHour || 0}</span>
          </div>
          <div className="api-stat">
            <span className="api-stat-label">Error Rate:</span>
            <span className={`api-stat-value ${systemData.api?.errorRate > 5 ? 'danger' : 'success'}`}>
              {systemData.api?.errorRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Frontend Performance Metrics */}
      {frontendMetrics && (
        <div className="status-section">
          <h3 className="section-title">Frontend Performance</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📡</div>
              <div className="metric-content">
                <div className="metric-label">API Calls</div>
                <div className="metric-value">{frontendMetrics.apiCalls || 0}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-label">Avg Response</div>
                <div className="metric-value">{frontendMetrics.avgApiTime || 0}ms</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👁️</div>
              <div className="metric-content">
                <div className="metric-label">Page Views</div>
                <div className="metric-value">{frontendMetrics.pageViews || 0}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">❌</div>
              <div className="metric-content">
                <div className="metric-label">Errors</div>
                <div className="metric-value" style={{ color: frontendMetrics.errors > 0 ? '#F44336' : '#4CAF50' }}>
                  {frontendMetrics.errors || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frontend Errors */}
      {frontendMetrics && frontendMetrics.recentErrors && frontendMetrics.recentErrors.length > 0 && (
        <div className="status-section">
          <h3 className="section-title">⚠️ Recent Errors & Issues</h3>
          <div className="activity-list">
            {frontendMetrics.recentErrors.map((error, index) => (
              <div key={index} className="activity-item" style={{ borderLeft: '3px solid #F44336', background: '#FFEBEE' }}>
                <div className="activity-icon">❌</div>
                <div className="activity-content">
                  <div className="activity-text" style={{ fontWeight: 'bold', color: '#C62828' }}>
                    {error.type === 'api_error' ? '🌐 API Error' : '⚡ Runtime Error'}: {error.message}
                  </div>
                  <div className="activity-time" style={{ fontSize: '0.8rem', color: '#666' }}>
                    Page: {error.page || 'Unknown'} • {new Date(error.timestamp).toLocaleString()}
                  </div>
                  {error.context && (
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      Context: {error.context}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache Status */}
      {cacheStatus && (
        <div className="status-section">
          <h3 className="section-title">💾 Cache Status</h3>
          {cacheStatus.available ? (
            <>
              <div className="metrics-grid" style={{ marginBottom: '1rem' }}>
                <div className="metric-card">
                  <div className="metric-icon">📦</div>
                  <div className="metric-content">
                    <div className="metric-label">Total Caches</div>
                    <div className="metric-value">{cacheStatus.totalCaches || 0}</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📄</div>
                  <div className="metric-content">
                    <div className="metric-label">Cached Items</div>
                    <div className="metric-value">{cacheStatus.totalItems || 0}</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <div className="metric-label">Status</div>
                    <div className="metric-value" style={{ fontSize: '1rem' }}>Active</div>
                  </div>
                </div>
                <div className="metric-card" style={{ cursor: 'pointer' }} onClick={clearAllCaches}>
                  <div className="metric-icon">🗑️</div>
                  <div className="metric-content">
                    <div className="metric-label">Action</div>
                    <div className="metric-value" style={{ fontSize: '0.9rem', color: '#F44336' }}>Clear All</div>
                  </div>
                </div>
              </div>
              {cacheStatus.caches && cacheStatus.caches.length > 0 && (
                <div className="api-stats">
                  {cacheStatus.caches.map((cache, index) => (
                    <div key={index} className="api-stat">
                      <span className="api-stat-label">{cache.name}:</span>
                      <span className="api-stat-value">{cache.count} items</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '1rem', background: '#FFEBEE', borderRadius: '8px', color: '#C62828' }}>
              ❌ Cache API not available: {cacheStatus.error}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {systemData && systemData.recentActivity && systemData.recentActivity.length > 0 && (
        <div className="status-section">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {systemData.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon || '📝'}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.message}</div>
                  <div className="activity-time">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="status-footer">
        <p className="last-updated">
          Last updated: {new Date(systemData?.timestamp || Date.now()).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default SystemStatus;
