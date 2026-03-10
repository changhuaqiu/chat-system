/**
 * Agent List Component - 像素风格
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
        return 'bg-pixel-accent-green border-pixel-accent-green';
      case 'offline':
        return 'bg-pixel-gray border-pixel-gray';
      case 'busy':
        return 'bg-pixel-accent-orange border-pixel-accent-orange';
      default:
        return 'bg-pixel-gray border-pixel-gray';
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
      <div className="flex items-center justify-center h-32 bg-bg-card">
        <div className="text-pixel-gray font-pixel-body">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-pixel-accent-pink text-center bg-bg-card border-4 border-border">
        {error}
        <button
          onClick={loadAgents}
          className="ml-2 text-pixel-accent-cyan hover:text-pixel-primary font-pixel-body"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="agent-list bg-bg-card border-4 border-border">
      {/* 标题 */}
      <div className="px-4 py-3 border-b-4 border-border">
        <h3 className="text-sm font-pixel-title text-white">Agent 列表</h3>
        <p className="text-xs text-pixel-gray mt-1 font-pixel-body">共 {agents.length} 个 Agent</p>
      </div>

      {/* Agent 列表 */}
      <div className="overflow-y-auto scrollbar-thin">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent && onSelectAgent(agent)}
            className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
              selectedAgentId === agent.id
                ? 'bg-pixel-primary/20 border-pixel-primary'
                : 'border-transparent hover:bg-bg-secondary hover:border-pixel-border-light'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className={`${agent.color || 'bg-pixel-primary'} w-10 h-10 border-4 border-pixel-primary flex items-center justify-center text-white font-pixel-title text-sm`}>
                {agent.avatar || agent.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-pixel-title text-white truncate">
                    {agent.name}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 border-2 text-xs font-pixel-body ${getStatusColor(agent.status)} text-white`}>
                    {getStatusText(agent.status)}
                  </span>
                </div>
                {agent.role && (
                  <p className="text-xs text-pixel-gray truncate font-pixel-body">
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
