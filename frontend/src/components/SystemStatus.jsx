import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/SystemStatus.css';

function SystemStatus({ showToast }) {
  const [systemData, setSystemData] = useState(null);
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
      const response = await api.get('/system/status');
      setSystemData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading system status:', error);
      showToast('❌ Failed to load system status', 'error');
      setLoading(false);
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

      {/* Recent Activity */}
      {systemData.recentActivity && systemData.recentActivity.length > 0 && (
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
          Last updated: {new Date(systemData.timestamp || Date.now()).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default SystemStatus;
