// Simple logging utility
// Replace console.log/error with structured logging

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');
  }

  _shouldLog(level) {
    const levels = Object.values(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.level);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';

    return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
  }

  error(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.log(this._formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  // Special method for API calls
  api(method, path, status, duration, meta = {}) {
    this.info(`API ${method} ${path} - ${status}`, { duration, ...meta });
  }

  // Special method for database queries
  db(query, duration, meta = {}) {
    this.debug(`DB Query executed`, { query: query.substring(0, 100), duration, ...meta });
  }
}

export const logger = new Logger();
export default logger;
