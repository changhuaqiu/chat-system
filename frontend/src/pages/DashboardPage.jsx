import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

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
      // Fetch agents
      const agentsResponse = await apiService.getAgents();
      // Ensure agents is always an array
      const agentsList = Array.isArray(agentsResponse.agents) ? agentsResponse.agents : [];
      setAgents(agentsList);
      
      // Calculate stats (mocking some for now as backend might not return all)
      const active = agentsList.filter(a => a.status === 'active' || a.status === 'online').length;
      
      // Ideally we should get this from a stats endpoint
      const statsData = await apiService.getStats();
      
      setStats({
        totalAgents: statsData.totalAgents || agentsList.length,
        activeAgents: statsData.activeAgents || active,
        totalMessages: statsData.totalMessages || 0, 
        todayMessages: statsData.todayMessages || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setAgents([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtext, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[#86868b]">{title}</p>
          <h3 className="text-3xl font-semibold text-[#1d1d1f] mt-2">{value}</h3>
          {subtext && <p className="text-xs text-[#86868b] mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const AgentCard = ({ agent }) => (
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
            {agent.avatar || '🤖'}
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f]">{agent.name}</h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              (agent.status === 'active' || agent.status === 'online') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {(agent.status === 'active' || agent.status === 'online') ? '● 在线' : '○ 离线'}
            </span>
          </div>
        </div>
        <button className="text-[#86868b] hover:text-[#1d1d1f]">
          <span className="text-xl">⋮</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#86868b]">模型</span>
          <span className="font-medium text-[#1d1d1f]">{agent.model || agent.model_provider || 'OpenAI'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#86868b]">类型</span>
          <span className="font-medium text-[#1d1d1f]">{agent.type || 'Assistant'}</span>
        </div>
        
        <div className="pt-3 border-t border-[#f5f5f7] flex space-x-2">
           <button className="flex-1 bg-[#f5f5f7] hover:bg-[#e5e5e5] text-[#1d1d1f] text-sm font-medium py-2 rounded-lg transition-colors">
             日志
           </button>
           <button className="flex-1 bg-[#f5f5f7] hover:bg-[#e5e5e5] text-[#1d1d1f] text-sm font-medium py-2 rounded-lg transition-colors">
             编辑
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 font-apple">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">仪表盘</h1>
        <p className="text-[#86868b] mt-1">AI 智能体网络概览</p>
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
          color="bg-green-500"
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
          <h2 className="text-xl font-semibold text-[#1d1d1f]">活跃智能体</h2>
          <div className="flex space-x-3">
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="搜索智能体..." 
                 className="pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all w-64"
               />
               <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
             </div>
             <button className="bg-[#007aff] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
               + 新建智能体
             </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007aff]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
            {/* Add placeholder card if empty */}
            {agents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-[#1d1d1f]">未找到智能体</h3>
                <p className="text-[#86868b] mt-1">请创建您的第一个 AI 智能体。</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
