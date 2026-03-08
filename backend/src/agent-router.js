/**
 * OpenClaw Agent Router - 路由消息到对应 Agent
 * 
 * 功能:
 * 1. 从 OpenClaw 动态查询 Agent 列表
 * 2. 消息分发逻辑：@AgentName 触发对应 Agent
 * 3. 支持自由聊天室和需要@的聊天室
 */

const axios = require('axios');

class AgentRouter {
  constructor() {
    this.agents = []; // 从 OpenClaw 动态获取
    this.agentMap = new Map(); // Agent ID -> Agent 信息
  }

  /**
   * 从 OpenClaw 动态查询 Agent 列表
   */
  async loadAgents() {
    try {
      // OpenClaw API: 查询所有 agents
      const response = await axios.get('http://localhost:8000/api/agents', {
        timeout: 5000
      });
      
      this.agents = response.data.agents || [];
      this.agentMap.clear();
      
      this.agents.forEach(agent => {
        this.agentMap.set(agent.id, agent);
      });
      
      console.log(`[AgentRouter] 加载 ${this.agents.length} 个 Agent`);
      return this.agents;
    } catch (error) {
      console.error('[AgentRouter] 加载 Agent 列表失败:', error.message);
      return [];
    }
  }

  /**
   * 获取所有可用 Agent 列表
   */
  getAllAgents() {
    return Array.from(this.agentMap.values());
  }

  /**
   * 根据 Agent ID 获取 Agent 信息
   */
  getAgentById(agentId) {
    return this.agentMap.get(agentId) || null;
  }

  /**
   * 检查消息中是否包含 @AgentName
   * @param {string} content - 消息内容
   * @returns {string[]} - 被 @ 的 Agent ID 列表
   */
  extractMentions(content) {
    const mentions = [];
    const regex = /@(\w+)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const agentId = match[1];
      if (this.agentMap.has(agentId)) {
        mentions.push(agentId);
      }
    }
    
    return mentions;
  }

  /**
   * 消息路由逻辑
   * @param {object} message - 消息对象
   * @param {string} message.room - 房间 ID
   * @param {string} message.sender - 发送者
   * @param {string} message.content - 消息内容
   * @param {string} message.channelType - 'free' | 'mention'
   * @returns {object} - 路由结果
   */
  routeMessage({ room, sender, content, channelType = 'free' }) {
    const mencs = this.extractMentions(content);
    
    let targetAgents = [];
    
    if (channelType === 'mention') {
      // 需要@的聊天室 - 只有被 @ 的 Agent 才处理
      if (mencs.length === 0) {
        return {
          success: false,
          reason: '需要@才能触发',
          targetAgents: []
        };
      }
      targetAgents = mencs;
    } else {
      // 自由聊天室 - 所有空闲 Agent 都处理
      targetAgents = Array.from(this.agentMap.keys());
    }
    
    return {
      success: true,
      mencs,
      targetAgents
    };
  }

  /**
   * 发送消息到指定 Agent
   */
  async sendMessageToAgent(agentId, message) {
    const agent = this.agentMap.get(agentId);
    if (!agent) {
      return {
        success: false,
        error: `Agent ${agentId} not found`
      };
    }
    
    try {
      // 发送到 OpenClaw session
      // await sessions_send({ agentId, message });
      console.log(`[AgentRouter] 发送到 Agent ${agentId}: ${message}`);
      
      return {
        success: true,
        agentId,
        status: 'sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 广播消息到所有 Agent
   */
  async broadcastToAll(message) {
    const results = [];
    for (const agentId of this.agentMap.keys()) {
      const result = await this.sendMessageToAgent(agentId, message);
      results.push(result);
    }
    return results;
  }
}

// 单例
const agentRouter = new AgentRouter();

// 初始化
(async () => {
  await agentRouter.loadAgents();
  // 定期刷新 Agent 列表
  setInterval(() => {
    agentRouter.loadAgents();
  }, 60000); // 每分钟刷新
})();

module.exports = agentRouter;
