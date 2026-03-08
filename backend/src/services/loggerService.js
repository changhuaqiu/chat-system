import { db } from '../db.js';

export const loggerService = {
  /**
   * Log a system event
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} agentId - Source of the log (e.g., system, frontend, bot-1)
   * @param {string} message - Log message
   * @param {object} details - Additional details (will be JSON stringified)
   * @returns {Promise<number>} - ID of the inserted log
   */
  log: (level, agentId, message, details = {}) => {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString();
      db.run(
        'INSERT INTO system_logs (level, agent_id, message, details, timestamp) VALUES (?, ?, ?, ?, ?)',
        [level, agentId, message, JSON.stringify(details), timestamp],
        function(err) {
          if (err) {
            console.error('Failed to write to system_logs:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  },

  info: (agentId, message, details) => loggerService.log('info', agentId, message, details),
  warn: (agentId, message, details) => loggerService.log('warn', agentId, message, details),
  error: (agentId, message, details) => loggerService.log('error', agentId, message, details),
  debug: (agentId, message, details) => loggerService.log('debug', agentId, message, details)
};

export default loggerService;
