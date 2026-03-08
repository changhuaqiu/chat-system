import { quotaService } from '../services/QuotaService.js';

export async function quotaRoutes(fastify, options) {
  // GET /api/api-keys/:key/quota - 获取 API Key 配额使用情况
  fastify.get('/api/api-keys/:key/quota', async (request, reply) => {
    const { key } = request.params;
    try {
      const quota = await quotaService.getApiKeyQuota(key);
      reply.send({ success: true, quota });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // PUT /api/api-keys/:key/quota - 更新 API Key 配额设置
  fastify.put('/api/api-keys/:key/quota', async (request, reply) => {
    const { key } = request.params;
    const { quotaLimit, rateLimit } = request.body;
    try {
      await quotaService.setApiKeyQuota(key, quotaLimit, rateLimit);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/api-keys/:key/model-quota - 获取分模型配额使用情况
  fastify.get('/api/api-keys/:key/model-quota', async (request, reply) => {
    const { key } = request.params;
    const { model } = request.query;
    try {
      let quota;
      if (model) {
        quota = await quotaService.getModelQuota(key, model);
      } else {
        quota = await quotaService.getAllModelQuotas(key);
      }
      reply.send({ success: true, quota });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // PUT /api/api-keys/:key/model-quota - 设置分模型配额
  fastify.put('/api/api-keys/:key/model-quota', async (request, reply) => {
    const { key } = request.params;
    const { model, requestLimit, rateLimit } = request.body;
    try {
      await quotaService.setModelQuota(key, model, requestLimit, rateLimit);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/api-keys/:key/reset - 重置配额
  fastify.post('/api/api-keys/:key/reset', async (request, reply) => {
    const { key } = request.params;
    const { model } = request.body; // 可选，重置分模型配额
    try {
      if (model) {
        await quotaService.resetModelQuota(key, model);
      } else {
        await quotaService.resetQuota(key);
      }
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/api-keys/:key/stats - 获取使用统计
  fastify.get('/api/api-keys/:key/stats', async (request, reply) => {
    const { key } = request.params;
    const { days = 7 } = request.query;
    try {
      const stats = await quotaService.getUsageStats(key, parseInt(days));
      const ranking = await quotaService.getModelUsageRanking(key);
      reply.send({ success: true, stats, ranking });
    } catch (error) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}
