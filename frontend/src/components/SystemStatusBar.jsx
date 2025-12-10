import { useState, useEffect } from 'react';
import { monitoringService } from '../services/monitoringService';
import '../styles/StatusBar.css';

function SystemStatusBar() {
  const [status, setStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    updateStatus();

    // Update status every 10 seconds
    const interval = setInterval(updateStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    const currentStatus = monitoringService.getStatus();
    const currentMetrics = monitoringService.getMetrics();
    setStatus(currentStatus);
    setMetrics(currentMetrics);
  };

  if (!status) return null;

  const getStatusColor = () => {
    switch (status.status) {
      case 'operational':
        return '#4CAF50'; // Green
      case 'minor_issues':
        return '#FFC107'; // Yellow
      case 'degraded':
        return '#FF9800'; // Orange
      case 'major_outage':
        return '#F44336'; // Red
      default:
        return '#4CAF50';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'operational':
        return '✅';
      case 'minor_issues':
        return '⚠️';
      case 'degraded':
        return '🔶';
      case 'major_outage':
        return '❌';
      default:
        return '✅';
    }
  };

  return (
    <div className="system-status-bar">
      <div
        className={`status-indicator ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ backgroundColor: getStatusColor() }}
      >
        <div className="status-main">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{status.message}</span>
          <span className="status-toggle">{isExpanded ? '▼' : '▲'}</span>
        </div>

        {isExpanded && metrics && (
          <div className="status-details" onClick={(e) => e.stopPropagation()}>
            <div className="status-metrics">
              <div className="metric-item">
                <span className="metric-label">Avg Response Time</span>
                <span className="metric-value">{status.avgResponseTime}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">API Calls</span>
                <span className="metric-value">{metrics.apiCalls}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Page Views</span>
                <span className="metric-value">{metrics.pageViews}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Errors</span>
                <span className="metric-value error">{status.errorCount}</span>
              </div>
            </div>

            {metrics.recentErrors.length > 0 && (
              <div className="recent-errors">
                <h4>Recent Issues</h4>
                {metrics.recentErrors.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-icon">⚠️</span>
                    <span className="error-message">{error.message}</span>
                    <span className="error-time">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {metrics.recentPageViews.length > 0 && (
              <div className="recent-pages">
                <h4>Recent Page Views</h4>
                {metrics.recentPageViews.slice(-5).map((page, index) => (
                  <div key={index} className="page-item">
                    <span className="page-name">{page.page}</span>
                    <span className="page-duration">
                      {page.duration ? `${Math.round(page.duration / 1000)}s` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="status-footer">
              <small>Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemStatusBar;
