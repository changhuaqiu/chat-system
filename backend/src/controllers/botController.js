import { db } from '../db.js';
import { botService } from '../services/botService.js';
import { oneApiService } from '../services/OneApiService.js';

export class BotController {
  constructor(database) {
    this.db = database || db; // Fallback to imported db if not provided
  }

  // Register or Update Bot
  // Returns: { success: true, action: 'created'|'updated', id }
  async registerBot(data) {
    let { id, name, avatar, provider_type, config } = data;

    // Validate required fields
    if (!id || !name || !provider_type) {
      throw new Error('Missing required fields (id, name, provider_type)');
    }

    // One API Integration: Automatically configure One API channel
    const llmProviders = ['openai', 'anthropic', 'alibaba', 'deepseek', 'oneapi'];

    // Check if One API is available before attempting setup
    let useOneApi = llmProviders.includes(provider_type);
    if (useOneApi) {
        try {
            const healthy = await oneApiService.checkHealth();
            if (!healthy) {
                console.warn('[BotController] One API is not reachable. Falling back to direct connection.');
                useOneApi = false;
            }
        } catch (e) {
            console.warn('[BotController] One API health check failed. Falling back to direct connection.');
            useOneApi = false;
        }
    }

    if (useOneApi) {
      try {
        console.log(`[BotController] Setting up One API for bot ${id} (${provider_type})...`);
        const models = config.model ? [config.model] : [];
        const oneApiConfig = await oneApiService.setupBotEnv(id, provider_type, config.apiKey, models, config.baseUrl);

        // Override config to point to One API
        config = {
          ...config,
          apiKey: oneApiConfig.apiKey,
          baseUrl: oneApiConfig.baseUrl,
          model: oneApiConfig.model,
          originalProvider: provider_type,
          originalModel: models[0]
        };
      } catch (error) {
        console.error('[BotController] One API setup failed:', error);
        // Fallback: If One API fails, we could either fail or proceed with direct connection (if allowed)
        // For now, we throw to ensure integrity.
        throw new Error(`One API Setup Failed: ${error.message}`);
      }
    }

    const configStr = typeof config === 'string' ? config : JSON.stringify(config);

    const row = this.db.prepare('SELECT id FROM bots WHERE id = ?').get(id);

    if (row) {
      // Update
      this.db.prepare(
        `UPDATE bots SET name = ?, avatar = ?, provider_type = ?, config = ?, status = 'online' WHERE id = ?`
      ).run(name, avatar, provider_type, configStr, id);
      return { success: true, action: 'updated', id };
    } else {
      // Insert
      this.db.prepare(
        `INSERT INTO bots (id, name, avatar, provider_type, config, status) VALUES (?, ?, ?, ?, ?, 'online')`
      ).run(id, name, avatar, provider_type, configStr);
      return { success: true, action: 'created', id };
    }
  }

  // Get all bots
  // Returns: Array of bots
  async getAllBots() {
    const rows = this.db.prepare(`
      SELECT b.*, s.total_requests, s.total_tokens, s.last_latency_ms, s.last_active as stats_last_active
      FROM bots b
      LEFT JOIN bot_stats s ON b.id = s.bot_id
      ORDER BY b.rowid DESC
    `).all();

    // Parse config string back to object
    const bots = rows.map(bot => {
      const config = bot.config ? JSON.parse(bot.config) : {};
      // Generate a consistent color based on bot ID if not set
      let color = bot.color;
      if (!color) {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500'];
        const index = bot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        color = colors[index];
      }
      return {
        id: bot.id,
        name: bot.name,
        avatar: bot.avatar,
        color,
        status: bot.status,
        lastActive: bot.stats_last_active || bot.last_active,
        model: config.originalModel || config.model,
        type: config.type || bot.provider_type,
        config,
        stats: {
          requests: bot.total_requests || 0,
          tokens: bot.total_tokens || 0,
          latency: bot.last_latency_ms || 0
        }
      };
    });
    return bots;
  }

  // Get bot by ID
  async getBotById(id) {
    const row = this.db.prepare('SELECT * FROM bots WHERE id = ?').get(id);
    if (!row) return null;

    const config = row.config ? JSON.parse(row.config) : {};
    return {
        ...row,
        config,
        model: config.originalModel || config.model
    };
  }

  // Delete bot
  async deleteBot(id) {
    // First, clean up One-API resources if exists
    try {
      const mapping = await oneApiService.getChannelMapping(id);
      if (mapping) {
        console.log(`[BotController] Cleaning up One-API resources for bot ${id}`);
        await oneApiService.deleteBotChannel(id);
      }
    } catch (e) {
      console.warn(`[BotController] Failed to clean up One-API for bot ${id}:`, e.message);
      // Continue with deletion even if One-API cleanup fails
    }

    this.db.prepare('DELETE FROM bots WHERE id = ?').run(id);
    return { success: true, deleted: id };
  }

  // Test Bot Connection
  // Uses the provided config directly to test connectivity by sending "hello" message
  async testConnection(data) {
    const { provider_type, config } = data;
    if (!provider_type) throw new Error('Missing provider_type');

    // Direct test: Use the provided config as-is
    // This works for:
    // 1. Direct LLM providers (OpenAI, Alibaba, DeepSeek, Anthropic)
    // 2. One-API channels (config should already contain One-API token and URL)
    // 3. Other provider types (webhook, cli, etc.)
    return botService.testConnection(provider_type, config);
  }
}
