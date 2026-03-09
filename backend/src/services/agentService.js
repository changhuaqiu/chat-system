/**
 * Chat-System Agent Service
 * 基于 OpenClaw Gateway 的 Agent 管理服务
 */

import { gatewayClient } from './GatewayClient.js';
import { config } from '../config/index.js';

// Agent 状态管理
class AgentService {
  constructor() {
    this.agents = new Map(); // agentId -> agentInfo
    this.agentSessions = new Map(); // agentId -> sessionKey
    this.lastHeartbeat = new Map(); // agentId -> timestamp
  }

  // 注册 agent
  registerAgent(agentId, sessionKey, agentInfo = {}) {
    this.agents.set(agentId, {
      id: agentId,
      sessionKey,
      ...agentInfo,
      status: 'online',
      lastActive: Date.now()
    });

    this.agentSessions.set(agentId, sessionKey);
    this.lastHeartbeat.set(agentId, Date.now());

    console.log(`Agent registered: ${agentId} (${sessionKey})`);

    // 列出所有已注册 agents
    console.log('Current agents:', Array.from(this.agents.keys()));
  }

  // 获取 agent
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  // 获取所有 agents
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  // 发送消息给 agent
  async sendMessage(agentId, message) {
    const sessionKey = this.agentSessions.get(agentId);

    if (!sessionKey) {
      console.error(`Agent ${agentId} not found`);
      return { success: false, error: 'Agent not found' };
    }

    try {
      // 调用 GatewayClient sessions_send
      const result = await gatewayClient.sessionsSend(sessionKey, message);

      this.updateLastActive(agentId);
      return { success: true, agentId, data: result };
    } catch (error) {
      console.error(`Failed to send message to ${agentId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // 批量发送消息
  broadcastMessage(message) {
    const results = [];

    for (const [agentId, sessionKey] of this.agentSessions) {
      const result = this.sendMessage(agentId, message);
      results.push({ agentId, ...result });
    }

    return results;
  }

  // 更新最后活跃时间
  updateLastActive(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastActive = Date.now();
      this.lastHeartbeat.set(agentId, Date.now());
      this.agents.set(agentId, agent);
    }
  }

  // 更新 agent 状态
  updateAgentStatus(agentId, status) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActive = Date.now();
      this.agents.set(agentId, agent);
      this.lastHeartbeat.set(agentId, Date.now());
    }
  }

  // 移除 agent
  removeAgent(agentId) {
    this.agents.delete(agentId);
    this.agentSessions.delete(agentId);
    this.lastHeartbeat.delete(agentId);
    console.log(`Agent removed: ${agentId}`);
  }

  // 心跳检查
  checkHeartbeats(maxTimeoutMs = 60000) {
    const now = Date.now();
    const inactiveAgents = [];

    for (const [agentId, heartbeat] of this.lastHeartbeat) {
      if (now - heartbeat > maxTimeoutMs) {
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.status = 'offline';
          this.agents.set(agentId, agent);
          inactiveAgents.push(agentId);
        }
      }
    }

    return inactiveAgents;
  }

  // 初始化并动态获取所有 OpenClaw agents
  async initialize() {
    try {
      // 尝试从 OpenClaw Gateway 获取 agents
      const agentsData = await gatewayClient.getAgents();
      const remoteAgents = agentsData.agents || [];

      if (remoteAgents.length > 0) {
        for (const agent of remoteAgents) {
          const sessionKey = `agent:${agent.id}:feishu:group:oc_7c67a3a4814e100e92a4eea9a27afd95`;
          this.registerAgent(agent.id, sessionKey, agent);
        }
        console.log(`Initialized ${this.agents.size} agents from OpenClaw Gateway`);
      } else {
        // 降级：使用默认 agents 配置
        await this.initializeDefaultAgents();
      }
    } catch (error) {
      console.warn('[AgentService] Failed to connect to OpenClaw Gateway, using default agents:', error.message);
      // 降级：使用默认 agents 配置
      await this.initializeDefaultAgents();
    }

    return this.getAllAgents();
  }

  // 初始化默认 agents（降级方案）
  async initializeDefaultAgents() {
    const defaultAgents = [
      {
        id: 'main',
        name: '主管 - main',
        role: 'management',
        color: 'bg-red-500',
        avatar: '主'
      },
      {
        id: 'dev',
        name: '开发 - dev',
        role: 'development',
        color: 'bg-blue-500',
        avatar: '开'
      },
      {
        id: 'fullstack-dev',
        name: '全栈开发 - fullstack-dev',
        role: 'code-generation',
        color: 'bg-green-500',
        avatar: '全'
      },
      {
        id: 'ux-design',
        name: 'UX 设计 - ux-design',
        role: 'design',
        color: 'bg-purple-500',
        avatar: 'UX'
      },
      {
        id: 'zhuguan',
        name: '研发主管 - zhuguan',
        role: 'management',
        color: 'bg-orange-500',
        avatar: '主'
      },
      {
        id: 'qa-tester',
        name: '测试 - qa-tester',
        role: 'testing',
        color: 'bg-teal-500',
        avatar: '测'
      }
    ];

    for (const agent of defaultAgents) {
      const sessionKey = `agent:${agent.id}:feishu:group:oc_7c67a3a4814e100e92a4eea9a27afd95`;
      this.registerAgent(agent.id, sessionKey, agent);
    }

    console.log(`Initialized ${this.agents.size} default agents`);
  }
}

// 导出单例实例
const agentService = new AgentService();

export default agentService;
