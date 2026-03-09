import { v4 as uuidv4 } from 'uuid';

export class ApiKeyController {
  constructor(database) {
    this.db = database;
  }

  // Create new API key
  createKey(name, environment, status) {
    const key = `sk-${uuidv4().replace(/-/g, '')}`;

    try {
      this.db.prepare('INSERT INTO api_keys (key, name, environment, status, quota_limit, rate_limit, quota_used) VALUES (?, ?, ?, ?, ?, ?, ?)').run(key, name, environment, status, 100000, 1000, 0);
      return { success: true, key, name, environment, status, quota_limit: 100000, rate_limit: 1000 };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  // List all API keys
  listKeys() {
    try {
      return this.db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all();
    } catch (error) {
      console.error('Error listing API keys:', error);
      throw error;
    }
  }

  // Delete API key
  deleteKey(key) {
    try {
      this.db.prepare('DELETE FROM api_keys WHERE key = ?').run(key);
      return { success: true, deleted: key };
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  // Update last used timestamp
  updateLastUsed(key) {
    try {
      this.db.prepare('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key = ?').run(key);
      return { success: true, key };
    } catch (error) {
      console.error('Error updating API key usage:', error);
      throw error;
    }
  }

  // Validate API key
  validateKey(key) {
    try {
      const apiKey = this.db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key);

      if (apiKey) {
        this.updateLastUsed(key);
        return { valid: true, key: apiKey };
      } else {
        return { valid: false };
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  }
}

export const apiKeyController = new ApiKeyController(null); // Initialize with null database
