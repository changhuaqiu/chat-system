// 简单的内存限流器（令牌桶算法）
const rateLimitMap = new Map();

export class RateLimiter {
  constructor() {
    this.defaultLimit = 60; // 默认 60 RPM
    this.windowMs = 60000;  // 1 分钟窗口
  }

  /**
   * 检查并应用限流
   * @param {string} key - 限流键（API Key）
   * @param {number} limit - 限制值（RPM）
   * @returns {Promise<{allowed: boolean, remaining?: number, resetAt?: number}>}
   */
  async check(key, limit = this.defaultLimit) {
    const now = Date.now();

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 0, resetTime: now + this.windowMs });
    }

    const record = rateLimitMap.get(key);

    // 窗口过期，重置
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    // 检查是否超限
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetTime
      };
    }

    // 增加计数
    record.count++;

    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: record.resetTime
    };
  }

  /**
   * 清理过期记录（定期调用）
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
}

// 每 5 分钟清理一次
setInterval(() => {
  const limiter = new RateLimiter();
  limiter.cleanup();
}, 300000);

export const rateLimiter = new RateLimiter();
