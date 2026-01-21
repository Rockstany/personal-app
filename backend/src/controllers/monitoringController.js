import logger from '../utils/logger.js';

// In-memory storage for monitoring logs (can be replaced with database later)
const monitoringLogs = [];
const MAX_LOGS = 1000;

export async function logMonitoringData(req, res) {
  try {
    const { type, data, userAgent, timestamp } = req.body;

    // Validate required fields
    if (!type || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, data' });
    }

    const logEntry = {
      id: Date.now(),
      type,
      data,
      userAgent,
      timestamp: timestamp || Date.now(),
      receivedAt: new Date().toISOString(),
      userId: req.userId || null
    };

    // Store in memory (keep last MAX_LOGS entries)
    monitoringLogs.push(logEntry);
    if (monitoringLogs.length > MAX_LOGS) {
      monitoringLogs.shift();
    }

    // Log to server console for important events
    if (type === 'error' || type === 'api_error') {
      logger.warn(`Client ${type}`, {
        endpoint: data.endpoint,
        error: data.error || data.message,
        page: data.page
      });
    } else if (type === 'slow_api') {
      logger.info(`Slow API reported by client`, {
        endpoint: data.endpoint,
        duration: data.duration
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Monitoring log error', { error: error.message });
    res.status(500).json({ error: 'Failed to log monitoring data' });
  }
}

export async function getMonitoringLogs(req, res) {
  try {
    const { type, limit = 100 } = req.query;

    let logs = monitoringLogs;

    // Filter by type if specified
    if (type) {
      logs = logs.filter(log => log.type === type);
    }

    // Return most recent logs first
    const result = logs.slice(-parseInt(limit)).reverse();

    res.json({
      total: logs.length,
      returned: result.length,
      logs: result
    });
  } catch (error) {
    logger.error('Get monitoring logs error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch monitoring logs' });
  }
}

export async function getMonitoringSummary(req, res) {
  try {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentLogs = monitoringLogs.filter(log => log.timestamp > oneHourAgo);

    const summary = {
      totalLogs: monitoringLogs.length,
      lastHour: {
        total: recentLogs.length,
        errors: recentLogs.filter(l => l.type === 'error' || l.type === 'api_error').length,
        slowApis: recentLogs.filter(l => l.type === 'slow_api').length,
        pageViews: recentLogs.filter(l => l.type === 'page_view').length
      },
      lastUpdated: new Date().toISOString()
    };

    res.json(summary);
  } catch (error) {
    logger.error('Get monitoring summary error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch monitoring summary' });
  }
}
