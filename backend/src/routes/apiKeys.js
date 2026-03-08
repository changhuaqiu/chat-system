import { ApiKeyController } from '../controllers/apiKeyController.js';

export async function apiKeysRoutes(fastify, options) {
  const apiKeyController = new ApiKeyController(fastify.db);
  
  // GET /api/api-keys - List all API keys
  fastify.get('/api/api-keys', async (request, reply) => {
    try {
      const keys = await apiKeyController.listKeys();
      reply.send({ success: true, keys });
    } catch (error) {
      console.error('Error listing API keys:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/api-keys - Create new API key
  fastify.post('/api/api-keys', async (request, reply) => {
    const { name, environment = 'production', status = 'active' } = request.body;
    
    if (!name) {
      return reply.code(400).send({ success: false, error: 'Name is required' });
    }

    try {
      const result = await apiKeyController.createKey(name, environment, status);
      reply.code(201).send(result);
    } catch (error) {
      console.error('Error creating API key:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // DELETE /api/api-keys/:key - Delete API key
  fastify.delete('/api/api-keys/:key', async (request, reply) => {
    const { key } = request.params;

    try {
      const result = await apiKeyController.deleteKey(key);
      reply.send(result);
    } catch (error) {
      console.error('Error deleting API key:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}
