/**
 * 统一配置模块
 * 集中管理所有环境变量和配置项
 */

export const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },

  // OpenClaw Gateway 配置
  openclaw: {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8000',
    sessionKeyTemplate: process.env.OPENCLAW_SESSION_KEY_TEMPLATE || 'agent:${agentId}:feishu:group:${groupId}'
  },

  // One-API 配置
  oneApi: {
    baseUrl: process.env.ONE_API_BASE_URL || 'http://localhost:3000',
    rootToken: process.env.ONE_API_ROOT_TOKEN || '',
    sessionCookie: process.env.ONE_API_SESSION_COOKIE || ''
  },

  // 数据库配置
  database: {
    path: process.env.DATABASE_PATH || './data/chat.db'
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || './logs'
  }
};

export default config;
