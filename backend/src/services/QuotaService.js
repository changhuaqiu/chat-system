import { db } from '../db.js';

export class QuotaService {
  /**
   * 检查 API Key 配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称（可选）
   * @returns {Promise<{allowed: boolean, reason?: string, rateLimit?: number}>}
   */
  async checkQuota(apiKey, model) {
    // 1. 检查总配额
    const totalQuota = await this.getApiKeyQuota(apiKey);
    if (totalQuota && totalQuota.quota_limit !== -1 && totalQuota.quota_used >= totalQuota.quota_limit) {
      return {
        allowed: true,  // 允许但降级限流
        rateLimit: totalQuota.rate_limit || 60,
        reason: 'quota_exceeded'
      };
    }

    // 2. 检查分模型配额
    if (model) {
      const modelQuota = await this.getModelQuota(apiKey, model);
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
  async incrementUsage(apiKey, model, status = 'success') {
    // 更新总配额
    db.run('UPDATE api_keys SET quota_used = COALESCE(quota_used, 0) + 1 WHERE key = ?', [apiKey]);

    // 更新分模型配额
    if (model) {
      db.run(
        `INSERT INTO api_key_model_quotas (api_key, model_name, request_used)
         VALUES (?, ?, 1)
         ON CONFLICT(api_key, model_name)
         DO UPDATE SET request_used = COALESCE(request_used, 0) + 1, updated_at = CURRENT_TIMESTAMP`,
        [apiKey, model]
      );
    }

    // 记录使用日志
    db.run(
      'INSERT INTO api_key_usage_logs (api_key, model_name, status) VALUES (?, ?, ?)',
      [apiKey, model, status]
    );
  }

  /**
   * 获取 API Key 配额
   * @param {string} apiKey - API Key
   * @returns {Promise<{quota_limit: number, quota_used: number, rate_limit: number}>}
   */
  async getApiKeyQuota(apiKey) {
    return new Promise((resolve, reject) => {
      db.get('SELECT quota_limit, quota_used, rate_limit FROM api_keys WHERE key = ?', [apiKey], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * 获取分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {Promise<{request_limit: number, request_used: number, rate_limit: number}>}
   */
  async getModelQuota(apiKey, model) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT request_limit, request_used, rate_limit FROM api_key_model_quotas WHERE api_key = ? AND model_name = ?',
        [apiKey, model],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * 获取所有分模型配额
   * @param {string} apiKey - API Key
   * @returns {Promise<Array>}
   */
  async getAllModelQuotas(apiKey) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM api_key_model_quotas WHERE api_key = ? ORDER BY model_name',
        [apiKey],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * 设置 API Key 配额
   * @param {string} apiKey - API Key
   * @param {number} quotaLimit - 请求配额上限，-1 表示无限制
   * @param {number} rateLimit - 限流：每分钟请求数
   * @returns {Promise<{success: boolean}>}
   */
  async setApiKeyQuota(apiKey, quotaLimit, rateLimit) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE api_keys SET quota_limit = ?, rate_limit = ? WHERE key = ?',
        [quotaLimit, rateLimit, apiKey],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }

  /**
   * 设置分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {number} requestLimit - 请求配额上限，-1 表示无限制
   * @param {number} rateLimit - 每分钟请求数限制
   * @returns {Promise<{success: boolean}>}
   */
  async setModelQuota(apiKey, model, requestLimit, rateLimit) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO api_key_model_quotas (api_key, model_name, request_limit, rate_limit)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(api_key, model_name)
         DO UPDATE SET request_limit = ?, rate_limit = ?, updated_at = CURRENT_TIMESTAMP`,
        [apiKey, model, requestLimit, rateLimit, requestLimit, rateLimit],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }

  /**
   * 重置 API Key 配额
   * @param {string} apiKey - API Key
   * @returns {Promise<{success: boolean}>}
   */
  async resetQuota(apiKey) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE api_keys SET quota_used = 0 WHERE key = ?', [apiKey], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * 重置分模型配额
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {Promise<{success: boolean}>}
   */
  async resetModelQuota(apiKey, model) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE api_key_model_quotas SET request_used = 0 WHERE api_key = ? AND model_name = ?',
        [apiKey, model],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  }

  /**
   * 获取使用统计（按天）
   * @param {string} apiKey - API Key
   * @param {number} days - 天数
   * @returns {Promise<Array>}
   */
  async getUsageStats(apiKey, days = 7) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT
           DATE(created_at) as date,
           COUNT(*) as requests,
           SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
           SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
           SUM(CASE WHEN status = 'ratelimited' THEN 1 ELSE 0 END) as rate_limited
         FROM api_key_usage_logs
         WHERE api_key = ? AND created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [apiKey, days],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  /**
   * 获取模型使用排行
   * @param {string} apiKey - API Key
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>}
   */
  async getModelUsageRanking(apiKey, limit = 10) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT
           model_name,
           COUNT(*) as requests
         FROM api_key_usage_logs
         WHERE api_key = ? AND model_name IS NOT NULL
         GROUP BY model_name
         ORDER BY requests DESC
         LIMIT ?`,
        [apiKey, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

export const quotaService = new QuotaService();
