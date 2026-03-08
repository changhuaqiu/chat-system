import axios from 'axios';
import { db } from '../db.js';

// Channel Type Mapping
const PROVIDER_MAPPING = {
  'openai': 1,
  'anthropic': 2,
  'google': 3,
  'alibaba': 14,
  'deepseek': 1, // DeepSeek is OpenAI compatible, usually type 1 works with custom base URL
  'baidu': 13,
  'tencent': 16,
  'oneapi': 1 // Fallback
};

class OneApiService {
  constructor() {
    // Lazy load environment variables from process.env
    // This ensures dotenv.config() has been called before access
    this._oneApiUrl = null;
    this._rootToken = null;
    this._client = null;
    this._sessionCookie = null;
  }

  get ONE_API_URL() {
    if (this._oneApiUrl === null) {
      this._oneApiUrl = process.env.ONE_API_BASE_URL || 'http://localhost:3002';
    }
    return this._oneApiUrl;
  }

  get ROOT_TOKEN() {
    if (this._rootToken === null) {
      this._rootToken = process.env.ONE_API_ROOT_TOKEN || '123456';
    }
    return this._rootToken;
  }

  get client() {
    if (this._client === null) {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Try to use session cookie if available
      const sessionCookie = process.env.ONE_API_SESSION_COOKIE;
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      } else {
        // Fallback to Bearer token
        headers['Authorization'] = `Bearer ${this.ROOT_TOKEN}`;
      }

      this._client = axios.create({
        baseURL: this.ONE_API_URL,
        headers: headers,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
    }
    return this._client;
  }

  /**
   * Get One-API base URL
   */
  getBaseUrl() {
    return this.ONE_API_URL;
  }

  /**
   * Check if One-API is configured (not localhost)
   */
  isConfigured() {
    return this.ONE_API_URL !== 'http://localhost:3002' && this.ROOT_TOKEN !== '123456';
  }

  async checkHealth() {
    try {
      const res = await this.client.get('/api/status');
      // Only check if status endpoint is reachable (no auth required)
      // Token validation is optional since session cookies may expire
      if (res.data && res.data.success !== false) {
        return true;
      }
      return false;
    } catch (e) {
      console.error('[OneApiService] Health check failed:', e.message);
      return false;
    }
  }

  /**
   * Check if root token is valid (separate from health check)
   */
  async validateToken() {
    try {
      const tokenRes = await this.client.get('/api/token/');
      if (tokenRes.data && tokenRes.data.success === false) {
        console.error('[OneApiService] Root Token is invalid:', tokenRes.data.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('[OneApiService] Token validation failed:', e.message);
      return false;
    }
  }

  /**
   * Get channel mapping from database
   */
  async getChannelMapping(botId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM oneapi_channels WHERE bot_id = ?', [botId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Save channel mapping to database
   */
  async saveChannelMapping(botId, channelData) {
    const { channel_id, channel_name, token_id, token_key, provider_type, model_name, original_api_key } = channelData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO oneapi_channels
         (bot_id, channel_id, channel_name, token_id, token_key, provider_type, model_name, original_api_key, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [botId, channel_id, channel_name, token_id, token_key, provider_type, model_name, original_api_key],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }

  /**
   * Delete channel mapping from database
   */
  async deleteChannelMapping(botId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM oneapi_channels WHERE bot_id = ?', [botId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Get all channel mappings
   */
  async getAllChannelMappings() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM oneapi_channels ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * Complete setup for a new bot: User -> Group -> Token -> Channel
   * Returns: { baseUrl, apiKey, model } for bot runtime
   */
  async setupBotEnv(botId, providerType, apiKey, models = [], upstreamBaseUrl = '') {
    // Check if mapping already exists
    const existingMapping = await this.getChannelMapping(botId);
    if (existingMapping && existingMapping.status === 'active') {
      console.log(`[OneApiService] Using existing channel for bot ${botId}`);
      return {
        baseUrl: `${this.ONE_API_URL}/v1`,
        apiKey: existingMapping.token_key,
        model: existingMapping.model_name
      };
    }

    const groupName = `group_${botId}`;
    const username = `user_${botId}`;

    try {
      // Create a unique model name for isolation
      const uniqueModelName = `${models[0] || 'default'}-${botId}`;
      const mapping = {};
      mapping[uniqueModelName] = models[0] || 'default';

      // 1. Create Channel in One-API
      const payload = {
        name: `Channel for ${botId}`,
        type: PROVIDER_MAPPING[providerType] || 1,
        key: apiKey,
        models: uniqueModelName, // String format for One-API
        model_mapping: JSON.stringify(mapping),
        groups: 'default' // String format for One-API
      };

      // Only add base_url if it's not empty
      if (upstreamBaseUrl && upstreamBaseUrl.trim() !== '') {
          payload.base_url = upstreamBaseUrl;
      }

      const channelRes = await this.client.post('/api/channel', payload);

      console.log('[OneApiService] Channel response:', JSON.stringify(channelRes.data, null, 2));

      // One-API returns { success: true, message: '' } without data on create
      // We need to fetch the channel list to get the created channel ID
      let channelId = null;
      let channelName = `Channel for ${botId}`;

      if (channelRes.data.success && channelRes.data.data) {
        channelId = channelRes.data.data.id;
        channelName = channelRes.data.data.name;
      } else if (channelRes.data.success) {
        // Fetch channel list to find the newly created channel
        const channelsRes = await this.client.get('/api/channel/?page=0');
        if (channelsRes.data.success && channelsRes.data.data) {
          const channel = channelsRes.data.data.find(c => c.name === channelName);
          if (channel) {
            channelId = channel.id;
          } else {
            throw new Error('Channel created but could not find it in list');
          }
        }
      } else {
        throw new Error(channelRes.data.message || 'Failed to create channel');
      }

      if (!channelId) {
        throw new Error('Channel created but ID is null');
      }

      // 2. Create a Token for this bot
      const tokenRes = await this.client.post('/api/token', {
        name: `Token for ${botId}`,
        remain_quota: -1,
        expired_time: -1
      });

      console.log('[OneApiService] Token response:', JSON.stringify(tokenRes.data, null, 2));

      // One-API returns { success: true, data: {...} } on create
      let tokenId = null;
      let tokenKey = null;

      if (tokenRes.data.success && tokenRes.data.data) {
        tokenId = tokenRes.data.data.id;
        tokenKey = tokenRes.data.data.key;
      } else if (tokenRes.data.success) {
        // Fetch token list to find the newly created token
        const tokensRes = await this.client.get('/api/token/?page=0');
        if (tokensRes.data.success && tokensRes.data.data) {
          const token = tokensRes.data.data.find(t => t.name === `Token for ${botId}`);
          if (token) {
            tokenId = token.id;
            tokenKey = token.key;
          } else {
            throw new Error('Token created but could not find it in list');
          }
        }
      } else {
        throw new Error(tokenRes.data.message || 'Failed to create token');
      }

      // 3. Save mapping to database
      await this.saveChannelMapping(botId, {
        channel_id: channelId,
        channel_name: channelName,
        token_id: tokenId,
        token_key: tokenKey,
        provider_type: providerType,
        model_name: uniqueModelName,
        original_api_key: apiKey
      });

      return {
        baseUrl: `${this.ONE_API_URL}/v1`,
        apiKey: tokenKey,
        model: uniqueModelName
      };

    } catch (error) {
      console.error('[OneApiService] Setup failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete bot's One-API channel and token
   */
  async deleteBotChannel(botId) {
    const mapping = await this.getChannelMapping(botId);
    if (!mapping) {
      return { success: true, message: 'No channel mapping found' };
    }

    try {
      // 1. Delete token from One-API
      if (mapping.token_id) {
        try {
          await this.client.delete(`/api/token/${mapping.token_id}`);
          console.log(`[OneApiService] Deleted token ${mapping.token_id}`);
        } catch (e) {
          console.warn(`[OneApiService] Failed to delete token ${mapping.token_id}:`, e.message);
        }
      }

      // 2. Delete channel from One-API
      if (mapping.channel_id) {
        try {
          await this.client.delete(`/api/channel/${mapping.channel_id}`);
          console.log(`[OneApiService] Deleted channel ${mapping.channel_id}`);
        } catch (e) {
          console.warn(`[OneApiService] Failed to delete channel ${mapping.channel_id}:`, e.message);
        }
      }

      // 3. Delete mapping from database
      await this.deleteChannelMapping(botId);

      return { success: true };
    } catch (error) {
      console.error('[OneApiService] Delete failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync channel status from One-API
   */
  async syncChannelStatus(botId) {
    const mapping = await this.getChannelMapping(botId);
    if (!mapping || !mapping.channel_id) {
      return null;
    }

    try {
      const channelRes = await this.client.get(`/api/channel/${mapping.channel_id}`);
      const status = channelRes.data.data.status === 1 ? 'active' : 'inactive';

      // Update database
      return new Promise((resolve, reject) => {
        db.run('UPDATE oneapi_channels SET status = ? WHERE bot_id = ?', [status, botId], (err) => {
          if (err) reject(err);
          else resolve({ ...mapping, status });
        });
      });
    } catch (e) {
      console.error('[OneApiService] Status sync failed:', e.message);
      return { ...mapping, status: 'unknown' };
    }
  }

  /**
   * Get One-API channel list
   */
  async getChannelList() {
    try {
      const res = await this.client.get('/api/channel/?page=0');
      console.log('[OneApiService] Channel list response:', JSON.stringify(res.data, null, 2));

      // One-API returns { success: true, data: [...] } directly
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          status: c.status,
          models: c.models
        }));
      }

      return [];
    } catch (e) {
      console.error('[OneApiService] Get channel list failed:', e.message);
      console.error('[OneApiService] Response:', e.response?.data);
      throw e;
    }
  }

  /**
   * Get channel models from One-API
   */
  async getChannelModels(channelId) {
    try {
      const res = await this.client.get(`/api/channel/${channelId}`);
      console.log('[OneApiService] Channel models response:', JSON.stringify(res.data, null, 2));

      // One-API returns { success: true, data: { channel object } }
      if (res.data.success && res.data.data) {
        const channel = res.data.data;
        // Parse models field (One-API may store as string or array)
        let models = [];
        if (typeof channel.models === 'string') {
          models = channel.models.split(',').map(m => m.trim());
        } else if (Array.isArray(channel.models)) {
          models = channel.models;
        }
        return models;
      }
      return [];
    } catch (e) {
      console.error('[OneApiService] Get channel models failed:', e.message);
      throw e;
    }
  }

  /**
   * Create Token for existing channel
   * Also registers the bot in the bots table
   */
  async createTokenForChannel(channelId, channelName, modelName, botName = null) {
    const botId = `bot-${Date.now().toString(36)}`;
    const tokenName = `Token-${botId}`;  // Shorter name format

    try {
      // 1. Create Token
      const tokenRes = await this.client.post('/api/token', {
        name: tokenName,
        remain_quota: -1,  // Unlimited
        expired_time: -1   // Never expire
      });

      let tokenId, tokenKey;
      if (tokenRes.data.success && tokenRes.data.data) {
        tokenId = tokenRes.data.data.id;
        tokenKey = tokenRes.data.data.key;
      } else if (tokenRes.data.success) {
        // Fetch token list to find the newly created token
        const tokensRes = await this.client.get('/api/token/?page=0');
        if (tokensRes.data.success && tokensRes.data.data) {
          const token = tokensRes.data.data.find(t => t.name === tokenName);
          if (token) {
            tokenId = token.id;
            tokenKey = token.key;
          } else {
            throw new Error('Token created but could not find it in list');
          }
        }
      } else {
        throw new Error('Failed to create token');
      }

      // 2. Save mapping to database
      await this.saveChannelMapping(botId, {
        channel_id: channelId,
        channel_name: channelName,
        token_id: tokenId,
        token_key: tokenKey,
        provider_type: 'oneapi',
        model_name: modelName,
        original_api_key: null  // No need for original key
      });

      // 3. Register bot in bots table (CRITICAL: This makes the bot visible to botService!)
      // Generate a consistent color based on bot ID
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500'];
      const colorIndex = botId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      const botColor = colors[colorIndex];

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO bots (id, name, avatar, color, provider_type, config, status) VALUES (?, ?, ?, ?, ?, ?, 'online')`,
          [
            botId,
            botName || `Bot ${botId}`,
            null, // Avatar can be set later
            botColor,
            'oneapi',
            JSON.stringify({
              apiKey: tokenKey,
              baseUrl: `${this.ONE_API_URL}/v1`,
              model: modelName,
              originalProvider: 'oneapi',
              originalModel: modelName
            })
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(`[OneApiService] Bot ${botId} registered in bots table`);

      return {
        botId,
        baseUrl: `${this.ONE_API_URL}/v1`,
        apiKey: tokenKey,
        model: modelName
      };
    } catch (error) {
      console.error('[OneApiService] Create token for channel failed:', error);
      throw error;
    }
  }
}

export const oneApiService = new OneApiService();
