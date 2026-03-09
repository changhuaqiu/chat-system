/**
 * Agent Context - 全局 Agent 状态管理
 *
 * 提供全局 Agent 列表状态，避免多个组件重复请求
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';

const AgentContext = createContext(null);

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取 Agent 列表
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAgents();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('[AgentContext] Failed to fetch agents:', err);
      setError(err.message);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // 刷新 Agent 列表
  const refreshAgents = useCallback(() => {
    return fetchAgents();
  }, [fetchAgents]);

  // 根据 ID 获取 Agent
  const getAgentById = useCallback((agentId) => {
    return agents.find(a => a.id === agentId) || null;
  }, [agents]);

  // 根据名称获取 Agent
  const getAgentByName = useCallback((name) => {
    return agents.find(a => a.name === name) || null;
  }, [agents]);

  // 获取在线 Agents
  const getOnlineAgents = useCallback(() => {
    return agents.filter(a => a.status === 'online');
  }, [agents]);

  // 根据角色获取 Agents
  const getAgentsByRole = useCallback((role) => {
    return agents.filter(a => a.role === role);
  }, [agents, agents]);

  const value = {
    agents,
    loading,
    error,
    refreshAgents,
    getAgentById,
    getAgentByName,
    getOnlineAgents,
    getAgentsByRole
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};

export default AgentContext;
