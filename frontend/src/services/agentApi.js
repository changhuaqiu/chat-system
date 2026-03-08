/**
 * Agent API Service
 * 封装所有与 Agent 相关的前端 API 调用
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const agentApi = {
  /**
   * 获取所有 Agent 列表
   * @returns {Promise<Array>} Agent 列表
   */
  getAgents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agents`);
      return response.data.agents || [];
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      throw error;
    }
  },

  /**
   * 获取单个 Agent 信息
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Agent 信息
   */
  getAgent: async (agentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agents/${agentId}`);
      return response.data.agent;
    } catch (error) {
      console.error(`Failed to fetch agent ${agentId}:`, error);
      throw error;
    }
  },

  /**
   * 发送消息给指定 Agent
   * @param {string} agentId - Agent ID
   * @param {string} message - 消息内容
   * @returns {Promise<Object>} 发送结果
   */
  sendMessage: async (agentId, message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/agents/${agentId}/message`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to send message to ${agentId}:`, error);
      throw error;
    }
  },

  /**
   * 广播消息给所有 Agent
   * @param {string} message - 消息内容
   * @returns {Promise<Object>} 广播结果
   */
  broadcastMessage: async (message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/agents/broadcast`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      throw error;
    }
  },

  /**
   * 检查 Agent 心跳状态
   * @returns {Promise<Object>} 心跳检查结果
   */
  checkHeartbeats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agents/heartbeat`);
      return response.data;
    } catch (error) {
      console.error('Failed to check heartbeats:', error);
      throw error;
    }
  }
};

export default agentApi;
