import { quotaService } from '../services/QuotaService.js';
import { rateLimiter } from './RateLimiter.js';

export async function quotaMiddleware(request, reply) {
  // 从请求头获取 API Key
  const apiKey = request.headers['x-api-key'];
  if (!apiKey) {
    return; // 没有 API Key，跳过配额检查
  }

  // 从请求体获取模型名称
  const model = request.body?.model;

  // 检查配额
  const quotaResult = await quotaService.checkQuota(apiKey, model);

  if (!quotaResult.allowed) {
    return reply.code(429).send({
      success: false,
      error: 'Quota exceeded',
      reason: quotaResult.reason
    });
  }

  // 如果超额降级限流
  if (quotaResult.reason) {
    const rateLimitResult = await rateLimiter.check(apiKey, quotaResult.rateLimit);

    if (!rateLimitResult.allowed) {
      return reply.code(429).send({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      });
    }

    // 添加限流响应头
    reply.header('X-RateLimit-Limit', quotaResult.rateLimit);
    reply.header('X-RateLimit-Remaining', rateLimitResult.remaining);
    reply.header('X-RateLimit-Reset', rateLimitResult.resetAt);
  }

  // 请求完成后增加使用量计数
  reply.hook('onSend', async (req, res, payload) => {
    const statusCode = res.statusCode;
    const status = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';
    await quotaService.incrementUsage(apiKey, model, status);
  });
}
