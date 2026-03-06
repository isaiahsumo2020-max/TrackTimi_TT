const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'tracktimi.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logger = {
  // Log attendance events
  logAttendance: (userId, action, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [ATTENDANCE] User ${userId} ${action}: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(`📋 ${logEntry.trim()}`);
  },

  // Log API requests
  logRequest: (req, userId = 'anonymous') => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [REQUEST] ${userId} ${req.method} ${req.path} ${JSON.stringify(req.body || {} | null)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
  },

  // Log errors
  logError: (error, context = '') => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [ERROR] ${context}: ${error.message}\n${error.stack}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.error(`❌ ${logEntry.trim()}`);
  },

  // Get recent logs (last 100 lines)
  getRecentLogs: (callback) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
      if (err) return callback(err);
      const lines = data.split('\n').slice(-100);
      callback(null, lines.join('\n'));
    });
  }
};

module.exports = logger;
