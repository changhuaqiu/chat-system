
/**
 * Base class for all bot adaptors
 */
export default class BotAdaptor {
  constructor(config) {
    this.config = config;
  }

  /**
   * Initialize the bot (connect to socket, spawn process, etc.)
   */
  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  /**
   * Send a message to the bot and get a response
   * @param {string} content - User message
   * @param {object} context - Chat history or context
   * @returns {Promise<string>} - Bot response
   */
  async chat(content, context) {
    throw new Error('chat() must be implemented');
  }

  /**
   * Check bot health status
   * @returns {Promise<string>} - 'online', 'offline', 'busy', 'error'
   */
  async checkStatus() {
    return 'offline';
  }

  /**
   * Test connection by sending a test message
   * Default implementation falls back to checkStatus()
   * Subclasses should override to provide real message testing
   * @returns {Promise<object>} - { success: boolean, response?: string, error?: string }
   */
  async testConnection() {
    try {
      const status = await this.checkStatus();
      if (status === 'online' || status === 'busy') {
        return { success: true, status };
      } else {
        return { success: false, error: status || 'Service unavailable' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get usage metrics
   * @returns {object} - { tokens: number, requests: number }
   */
  getMetrics() {
    return { tokens: 0, requests: 0 };
  }
}
