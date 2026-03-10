import { v4 as uuidv4 } from 'uuid';

export class ApiKeyController {
  constructor(database) {
    this.db = database;
  }

  // Create new API key
  async createKey(name, environment, status) {
    const key = `sk-${uuidv4().replace(/-/g, '')}`;

    this.db.prepare(
      'INSERT INTO api_keys (key, name, environment, status, quota_limit, rate_limit, quota_used) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(key, name, environment, status, 100000, 1000, 0);

    return { success: true, key, name, environment, status, quota_limit: 100000, rate_limit: 1000 };
  }

  // List all API keys
  async listKeys() {
    return this.db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all();
  }

  // Delete API key
  async deleteKey(key) {
    this.db.prepare('DELETE FROM api_keys WHERE key = ?').run(key);
    return { success: true, deleted: key };
  }

  // Update last used timestamp
  async updateLastUsed(key) {
    this.db.prepare('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key = ?').run(key);
    return { success: true, key };
  }

  // Validate API key
  async validateKey(key) {
    const apiKey = this.db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key);

    if (apiKey) {
      await this.updateLastUsed(key);
      return { valid: true, key: apiKey };
    } else {
      return { valid: false };
    }
  }
}

export const apiKeyController = new ApiKeyController(null); // Initialize with null database
