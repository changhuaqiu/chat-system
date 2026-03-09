import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalMessages: 0,
    todayMessages: 0
  });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const agentsResponse = await apiService.getAgents();
      const agentsList = Array.isArray(agentsResponse.agents) ? agentsResponse.agents : [];
      setAgents(agentsList);

      const active = agentsList.filter(a => a.status === 'active' || a.status === 'online').length;
      const statsData = await apiService.getStats();

      setStats({
        totalAgents: statsData.totalAgents || agentsList.length,
        activeAgents: statsData.activeAgents || active,
        totalMessages: statsData.totalMessages || 0,
        todayMessages: statsData.todayMessages || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtext, icon, color }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <h3 className="text-3xl font-semibold text-white mt-2">{value}</h3>
          {subtext && <p className="text-xs text-white/40 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-lg shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const AgentCard = ({ agent }) => (
    <div className="character-card p-5 rounded-2xl border border-white/10 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl border border-white/10">
            {agent.avatar || '🤖'}
          </div>
          <div>
            <h4 className="font-semibold text-white">{agent.name}</h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              (agent.status === 'active' || agent.status === 'online') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
            }`}>
              {(agent.status === 'active' || agent.status === 'online') ? '● 在线' : '○ 离线'}
            </span>
          </div>
        </div>
        <button className="text-white/40 hover:text-white">
          <span className="text-xl">⋮</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">模型</span>
          <span className="font-medium text-white">{agent.model || agent.model_provider || 'OpenAI'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">类型</span>
          <span className="font-medium text-white">{agent.type || 'Assistant'}</span>
        </div>

        <div className="pt-3 border-t border-white/10 flex space-x-2">
           <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-white/10">
             日志
           </button>
           <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-white/10">
             编辑
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape w-96 h-96 bg-purple-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="floating-shape w-80 h-80 bg-blue-500 top-1/2 right-0 translate-x-1/3"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">仪表盘</h1>
          <p className="text-white/40 mt-1">AI 智能体网络概览</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="智能体总数"
            value={stats.totalAgents}
            subtext="本周新增 2 个"
            icon="🤖"
            color="bg-blue-500"
          />
          <StatCard
            title="当前在线"
            value={stats.activeAgents}
            subtext={`在线率 ${stats.totalAgents ? Math.round((stats.activeAgents / stats.totalAgents) * 100) : 0}%`}
            icon="🟢"
            color="bg-emerald-500"
          />
          <StatCard
            title="今日消息"
            value={stats.todayMessages}
            subtext="较昨日 +12%"
            icon="💬"
            color="bg-indigo-500"
          />
          <StatCard
            title="历史消息总数"
            value={stats.totalMessages.toLocaleString()}
            subtext="累计处理消息"
            icon="⚡"
            color="bg-orange-500"
          />
        </div>

        {/* Agent Grid Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">活跃智能体</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30"></i>
                <input
                  type="text"
                  placeholder="搜索智能体..."
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all w-64"
                />
              </div>
              <button className="btn-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center gap-2">
                <i className="ri-add-line"></i>
                <span>新建智能体</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {agents.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-white/20">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-white">未找到智能体</h3>
                  <p className="text-white/40 mt-1">请创建您的第一个 AI 智能体。</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
