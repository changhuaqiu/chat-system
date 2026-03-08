/**
 * Agent List Component
 * 显示所有 Agent 的状态列表
 */

import { useState, useEffect } from 'react';
import agentApi from '../services/agentApi';

function AgentList({ onSelectAgent, selectedAgentId }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载 Agent 列表
  useEffect(() => {
    loadAgents();
    
    // 每 30 秒刷新一次 Agent 状态
    const interval = setInterval(loadAgents, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentList = await agentApi.getAgents();
      setAgents(agentList);
      setError(null);
    } catch (err) {
      setError('加载 Agent 列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-400';
      case 'busy':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'offline':
        return '离线';
      case 'busy':
        return '忙碌';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
        <button 
          onClick={loadAgents}
          className="ml-2 text-blue-500 hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="agent-list">
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Agent 列表</h3>
        <p className="text-xs text-gray-500 mt-1">共 {agents.length} 个 Agent</p>
      </div>

      {/* Agent 列表 */}
      <div className="overflow-y-auto">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent && onSelectAgent(agent)}
            className={`px-4 py-3 cursor-pointer transition-colors ${
              selectedAgentId === agent.id
                ? 'bg-indigo-50 border-l-4 border-indigo-500'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className={`${agent.color || 'bg-blue-500'} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                {agent.avatar || agent.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {agent.name}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)} text-white`}>
                    {getStatusText(agent.status)}
                  </span>
                </div>
                {agent.role && (
                  <p className="text-xs text-gray-500 truncate">
                    {agent.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentList;
