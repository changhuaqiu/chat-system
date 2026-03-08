import { v4 as uuidv4 } from 'uuid';

export class ApiKeyController {
  constructor(database) {
    this.db = database;
  }

  // Create new API key
  async createKey(name, environment, status) {
    return new Promise((resolve, reject) => {
      const key = `sk-${uuidv4().replace(/-/g, '')}`;

      try {
        this.db.run(
          'INSERT INTO api_keys (key, name, environment, status, quota_limit, rate_limit, quota_used) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [key, name, environment, status, 100000, 1000, 0],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ success: true, key, name, environment, status, quota_limit: 100000, rate_limit: 1000 });
            }
          }
        );
      } catch (error) {
        console.error('Error creating API key:', error);
        reject(error);
      }
    });
  }

  // List all API keys
  async listKeys() {
    return new Promise((resolve, reject) => {
      try {
        this.db.all('SELECT * FROM api_keys ORDER BY created_at DESC', (err, keys) => {
          if (err) {
            reject(err);
          } else {
            resolve(keys);
          }
        });
      } catch (error) {
        console.error('Error listing API keys:', error);
        reject(error);
      }
    });
  }

  // Delete API key
  async deleteKey(key) {
    return new Promise((resolve, reject) => {
      try {
        this.db.run('DELETE FROM api_keys WHERE key = ?', [key], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, deleted: key });
          }
        });
      } catch (error) {
        console.error('Error deleting API key:', error);
        reject(error);
      }
    });
  }

  // Update last used timestamp
  async updateLastUsed(key) {
    return new Promise((resolve, reject) => {
      try {
        this.db.run('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key = ?', [key], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, key });
          }
        });
      } catch (error) {
        console.error('Error updating API key usage:', error);
        reject(error);
      }
    });
  }

  // Validate API key
  async validateKey(key) {
    return new Promise((resolve, reject) => {
      try {
        this.db.get('SELECT * FROM api_keys WHERE key = ?', [key], async (err, apiKey) => {
          if (err) {
            reject(err);
            return;
          }

          if (apiKey) {
            try {
              await this.updateLastUsed(key);
              resolve({ valid: true, key: apiKey });
            } catch (error) {
              reject(error);
            }
          } else {
            resolve({ valid: false });
          }
        });
      } catch (error) {
        console.error('Error validating API key:', error);
        reject(error);
      }
    });
  }
}

export const apiKeyController = new ApiKeyController(null); // Initialize with null database
