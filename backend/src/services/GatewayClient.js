/**
 * OpenClaw Gateway Client
 * 负责与 OpenClaw Gateway 进行通信
 */

import axios from 'axios';
import { config } from '../config/index.js';

export class GatewayClient {
  constructor(baseUrl = config.openclaw.gatewayUrl) {
    this.baseUrl = baseUrl;
    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000
    });
  }

  /**
   * 发送消息到指定 session
   * @param {string} sessionKey - Session 密钥
   * @param {object} message - 消息对象
   * @returns {Promise<object>} - API 响应
   */
  async sessionsSend(sessionKey, message) {
    try {
      const response = await this.httpClient.post('/api/v1/sessions/message', {
        sessionKey,
        message
      });
      return response.data;
    } catch (error) {
      console.error('[GatewayClient] sessionsSend error:', error.message);
      throw error;
    }
  }

  /**
   * 获取 session 列表
   * @returns {Promise<object>} - Session 列表
   */
  async sessionsList() {
    try {
      const response = await this.httpClient.get('/api/v1/sessions');
      return response.data;
    } catch (error) {
      console.error('[GatewayClient] sessionsList error:', error.message);
      throw error;
    }
  }

  /**
   * 获取 Agent 列表
   * @returns {Promise<object>} - Agent 列表
   */
  async getAgents() {
    try {
      const response = await this.httpClient.get('/api/agents');
      return response.data;
    } catch (error) {
      console.error('[GatewayClient] getAgents error:', error.message);
      throw error;
    }
  }

  /**
   * 创建新 session
   * @param {string} agentId - Agent ID
   * @param {string} channelType - 频道类型 (feishu, etc.)
   * @param {string} groupId - 群组 ID
   * @returns {Promise<object>} - 创建的 session 信息
   */
  async createSession(agentId, channelType = 'feishu', groupId) {
    try {
      const response = await this.httpClient.post('/api/v1/sessions', {
        agentId,
        channelType,
        groupId
      });
      return response.data;
    } catch (error) {
      console.error('[GatewayClient] createSession error:', error.message);
      throw error;
    }
  }

  /**
   * 发送心跳
   * @param {string} sessionKey - Session 密钥
   * @returns {Promise<object>} - 心跳响应
   */
  async heartbeat(sessionKey) {
    try {
      const response = await this.httpClient.post('/api/v1/sessions/heartbeat', {
        sessionKey
      });
      return response.data;
    } catch (error) {
      console.error('[GatewayClient] heartbeat error:', error.message);
      throw error;
    }
  }
}

// 导出单例实例
export const gatewayClient = new GatewayClient();

export default gatewayClient;
