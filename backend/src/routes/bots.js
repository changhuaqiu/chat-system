import { BotController } from '../controllers/botController.js';
import { db } from '../db.js';
import { oneApiService } from '../services/OneApiService.js';

export async function botsRoutes(fastify, options) {
  const botController = new BotController(db);

  // GET /api/bots - List all bots
  fastify.get('/api/bots', async (request, reply) => {
    try {
      const bots = await botController.getAllBots();
      reply.send({ success: true, bots });
    } catch (error) {
      console.error('Error fetching bots:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/bots/:id - Get bot by ID
  fastify.get('/api/bots/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const bot = await botController.getBotById(id);
      if (!bot) {
        return reply.code(404).send({ success: false, error: 'Bot not found' });
      }
      reply.send({ success: true, bot });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/bots/:id/oneapi-status - Get One-API channel status
  fastify.get('/api/bots/:id/oneapi-status', async (request, reply) => {
    const { id } = request.params;
    try {
      const mapping = await oneApiService.getChannelMapping(id);
      if (!mapping) {
        return reply.code(404).send({ success: false, error: 'One-API mapping not found' });
      }
      const status = await oneApiService.syncChannelStatus(id);
      reply.send({ success: true, mapping: status });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/bots - Register/Update bot
  fastify.post('/api/bots', async (request, reply) => {
    try {
      // Support both legacy (botId) and new (id) fields
      const body = request.body;
      const data = {
          id: body.id || body.botId,
          name: body.name,
          avatar: body.avatar,
          provider_type: body.provider_type || 'llm',
          config: body.config || { model: body.model, apiKey: body.apiKey } // Legacy fallback
      };

      const result = await botController.registerBot(data);
      reply.code(201).send(result);
    } catch (error) {
      console.error('Error registering bot:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // PUT /api/bots/:id - Update bot
  fastify.put('/api/bots/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const body = request.body;
      const data = {
        id,
        name: body.name,
        avatar: body.avatar,
        provider_type: body.provider_type,
        config: body.config
      };

      const result = await botController.registerBot(data);
      reply.send({ success: true, action: result.action, id });
    } catch (error) {
      console.error('Error updating bot:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // DELETE /api/bots/:id - Delete bot
  fastify.delete('/api/bots/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await botController.deleteBot(id);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/bots/test - Test Connection
  fastify.post('/api/bots/test', async (request, reply) => {
      try {
          const result = await botController.testConnection(request.body);
          reply.send(result);
      } catch (error) {
          reply.code(500).send({ success: false, error: error.message });
      }
  });

  // GET /api/bots/oneapi/check - Check One-API health
  fastify.get('/api/bots/oneapi/check', async (request, reply) => {
    try {
      const healthy = await oneApiService.checkHealth();
      const isConfigured = oneApiService.isConfigured();
      const baseUrl = oneApiService.getBaseUrl();
      reply.send({
        success: true,
        healthy,
        isConfigured,
        baseUrl
      });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/bots/oneapi/channels - Get One-API channel list
  fastify.get('/api/bots/oneapi/channels', async (request, reply) => {
    try {
      const channels = await oneApiService.getChannelList();
      reply.send({ success: true, channels });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/bots/oneapi/channels/:channelId/models - Get channel models
  fastify.get('/api/bots/oneapi/channels/:channelId/models', async (request, reply) => {
    const { channelId } = request.params;
    try {
      const models = await oneApiService.getChannelModels(channelId);
      reply.send({ success: true, models });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/bots/oneapi/create-token - Create token from channel
  fastify.post('/api/bots/oneapi/create-token', async (request, reply) => {
    const { channelId, channelName, modelName, botName } = request.body;
    try {
      const result = await oneApiService.createTokenForChannel(channelId, channelName, modelName, botName);
      reply.send({ success: true, ...result });
    } catch (error) {
      console.error('[bots.js] Error creating token:', error.message);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}
