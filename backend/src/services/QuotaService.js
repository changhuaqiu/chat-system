import { db } from '../db.js';

export class QuotaService {
  /**
   * 检查 API Key 配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称（可选）
   * @returns {{allowed: boolean, reason?: string, rateLimit?: number}}
   */
  async checkQuota(apiKey, model) {
    // 1. 检查总配额
    const totalQuota = this.getApiKeyQuota(apiKey);
    if (totalQuota && totalQuota.quota_limit !== -1 && totalQuota.quota_used >= totalQuota.quota_limit) {
      return {
        allowed: true,  // 允许但降级限流
        rateLimit: totalQuota.rate_limit || 60,
        reason: 'quota_exceeded'
      };
    }

    // 2. 检查分模型配额
    if (model) {
      const modelQuota = this.getModelQuota(apiKey, model);
      if (modelQuota && modelQuota.request_limit !== -1 && modelQuota.request_used >= modelQuota.request_limit) {
        return {
          allowed: true,  // 允许但降级限流
          rateLimit: modelQuota.rate_limit || 60,
          reason: 'model_quota_exceeded'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * 增加使用量计数
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {string} status - 请求状态：success/error/ratelimited
   */
  incrementUsage(apiKey, model, status = 'success') {
    // 更新总配额
    db.prepare('UPDATE api_keys SET quota_used = COALESCE(quota_used, 0) + 1 WHERE key = ?').run(apiKey);

    // 更新分模型配额
    if (model) {
      db.prepare(
        `INSERT INTO api_key_model_quotas (api_key, model_name, request_used)
         VALUES (?, ?, 1)
         ON CONFLICT(api_key, model_name)
         DO UPDATE SET request_used = COALESCE(request_used, 0) + 1, updated_at = CURRENT_TIMESTAMP`
      ).run(apiKey, model);
    }

    // 记录使用日志
    db.prepare(
      'INSERT INTO api_key_usage_logs (api_key, model_name, status) VALUES (?, ?, ?)'
    ).run(apiKey, model, status);
  }

  /**
   * 获取 API Key 配额
   * @param {string} apiKey - API Key
   * @returns {{quota_limit: number, quota_used: number, rate_limit: number}}
   */
  getApiKeyQuota(apiKey) {
    return db.prepare('SELECT quota_limit, quota_used, rate_limit FROM api_keys WHERE key = ?').get(apiKey);
  }

  /**
   * 获取分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {{request_limit: number, request_used: number, rate_limit: number}}
   */
  getModelQuota(apiKey, model) {
    return db.prepare(
      'SELECT request_limit, request_used, rate_limit FROM api_key_model_quotas WHERE api_key = ? AND model_name = ?'
    ).get(apiKey, model);
  }

  /**
   * 获取所有分模型配额
   * @param {string} apiKey - API Key
   * @returns {Array}
   */
  getAllModelQuotas(apiKey) {
    return db.prepare(
      'SELECT * FROM api_key_model_quotas WHERE api_key = ? ORDER BY model_name'
    ).all(apiKey);
  }

  /**
   * 设置 API Key 配额
   * @param {string} apiKey - API Key
   * @param {number} quotaLimit - 请求配额上限，-1 表示无限制
   * @param {number} rateLimit - 限流：每分钟请求数
   * @returns {{success: boolean}}
   */
  setApiKeyQuota(apiKey, quotaLimit, rateLimit) {
    db.prepare('UPDATE api_keys SET quota_limit = ?, rate_limit = ? WHERE key = ?').run(quotaLimit, rateLimit, apiKey);
    return { success: true };
  }

  /**
   * 设置分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {number} requestLimit - 请求配额上限，-1 表示无限制
   * @param {number} rateLimit - 每分钟请求数限制
   * @returns {{success: boolean}}
   */
  setModelQuota(apiKey, model, requestLimit, rateLimit) {
    db.prepare(
      `INSERT INTO api_key_model_quotas (api_key, model_name, request_limit, rate_limit)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(api_key, model_name)
       DO UPDATE SET request_limit = ?, rate_limit = ?, updated_at = CURRENT_TIMESTAMP`
    ).run(apiKey, model, requestLimit, rateLimit, requestLimit, rateLimit);
    return { success: true };
  }

  /**
   * 重置 API Key 配额
   * @param {string} apiKey - API Key
   * @returns {{success: boolean}}
   */
  resetQuota(apiKey) {
    db.prepare('UPDATE api_keys SET quota_used = 0 WHERE key = ?').run(apiKey);
    return { success: true };
  }

  /**
   * 重置分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {{success: boolean}}
   */
  resetModelQuota(apiKey, model) {
    db.prepare(
      'UPDATE api_key_model_quotas SET request_used = 0 WHERE api_key = ? AND model_name = ?'
    ).run(apiKey, model);
    return { success: true };
  }

  /**
   * 获取使用统计（按天）
   * @param {string} apiKey - API Key
   * @param {number} days - 天数
   * @returns {Array}
   */
  getUsageStats(apiKey, days = 7) {
    return db.prepare(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) as requests,
         SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
         SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
         SUM(CASE WHEN status = 'ratelimited' THEN 1 ELSE 0 END) as rate_limited
       FROM api_key_usage_logs
       WHERE api_key = ? AND created_at >= datetime('now', '-' || ? || ' days')
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    ).all(apiKey, days);
  }

  /**
   * 获取模型使用排行
   * @param {string} apiKey - API Key
   * @param {number} limit - 返回数量限制
   * @returns {Array}
   */
  getModelUsageRanking(apiKey, limit = 10) {
    return db.prepare(
      `SELECT
         model_name,
         COUNT(*) as requests
       FROM api_key_usage_logs
       WHERE api_key = ? AND model_name IS NOT NULL
       GROUP BY model_name
       ORDER BY requests DESC
       LIMIT ?`
    ).all(apiKey, limit);
  }
}

export const quotaService = new QuotaService();
