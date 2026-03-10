/**
 * Dashboard Page - 像素风格
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAgents } from '../contexts/AgentContext';
import {
  MessageTrendChart,
  AgentPerformancePanel,
  ApiUsageChart
} from '../components/Dashboard';

const REFRESH_INTERVAL = 30000;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading, refreshAgents } = useAgents();

  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalMessages: 0,
    todayMessages: 0,
    todayGrowth: 0,
    newAgentsThisWeek: 0,
    onlineRate: 0,
    avgLatency: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [apiUsageData, setApiUsageData] = useState({ modelDistribution: [], totals: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [dashboardStats, trendResponse, performanceResponse, apiUsageResponse] = await Promise.all([
        apiService.getDashboardStats().catch(() => null),
        apiService.getMessageTrend(7).catch(() => ({ data: [] })),
        apiService.getAgentPerformance(10).catch(() => ({ data: [] })),
        apiService.getApiUsage(7).catch(() => ({ modelDistribution: [], totals: {} }))
      ]);

      if (dashboardStats) {
        setStats({
          totalAgents: dashboardStats.overview?.totalAgents || agents.length,
          activeAgents: dashboardStats.overview?.activeAgents || 0,
          totalMessages: dashboardStats.messages?.total || 0,
          todayMessages: dashboardStats.messages?.today || 0,
          todayGrowth: dashboardStats.messages?.todayGrowth || 0,
          newAgentsThisWeek: dashboardStats.overview?.newAgentsThisWeek || 0,
          onlineRate: dashboardStats.overview?.onlineRate || 0,
          avgLatency: dashboardStats.api?.avgLatency || 0
        });
      } else {
        const active = agents.filter(a => a.status === 'active' || a.status === 'online').length;
        setStats(prev => ({
          ...prev,
          totalAgents: agents.length,
          activeAgents: active,
          onlineRate: agents.length > 0 ? Math.round((active / agents.length) * 100) : 0
        }));
      }

      setTrendData(trendResponse.data || []);
      setPerformanceData(performanceResponse.data || []);
      setApiUsageData({
        modelDistribution: apiUsageResponse.modelDistribution || [],
        totals: apiUsageResponse.totals || {}
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [agents]);

  useEffect(() => {
    refreshAgents();
    fetchDashboardData(true);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  const filteredAgents = agents.filter(agent => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (agent.name && agent.name.toLowerCase().includes(query)) ||
      (agent.description && agent.description.toLowerCase().includes(query))
    );
  });

  // Stat Card Component - 像素风格
  const StatCard = ({ title, value, subtext, icon, color, trend }) => (
    <div className="bg-bg-card p-6 border-4 border-border shadow-pixel-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-pixel-title text-pixel-gray">{title}</p>
          <h3 className="text-2xl font-pixel-title text-white mt-2">{value}</h3>
          {subtext && (
            <p className={`text-xs mt-1 font-pixel-body ${trend > 0 ? 'text-pixel-accent-green' : trend < 0 ? 'text-pixel-accent-pink' : 'text-pixel-gray'}`}>
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 ${color} border-4 flex items-center justify-center text-white text-lg shadow-pixel-sm`}
             style={{ borderColor: color.replace('bg-', '').includes('blue') ? '#3b82f6' : color.includes('emerald') ? '#059669' : color.includes('indigo') ? '#4f46e5' : '#c2410c' }}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Agent Card Component - 像素风格
  const AgentCard = ({ agent }) => (
    <div className="bg-bg-card p-5 border-4 border-border shadow-pixel-md hover:shadow-pixel-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-bg-secondary border-4 border-border flex items-center justify-center text-2xl">
            {agent.avatar || '🤖'}
          </div>
          <div>
            <h4 className="font-pixel-body text-base text-white">{agent.name}</h4>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-pixel-title border-2 ${
              (agent.status === 'active' || agent.status === 'online') ? 'bg-pixel-accent-green/20 text-pixel-accent-green border-pixel-accent-green' : 'bg-bg-secondary text-pixel-gray border-border'
            }`}>
              {(agent.status === 'active' || agent.status === 'online') ? '● 在线' : '○ 离线'}
            </span>
          </div>
        </div>
        <button className="text-pixel-gray hover:text-white">
          <span className="text-xl">⋮</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-pixel-gray font-pixel-body">模型</span>
          <span className="font-pixel-body text-white">{agent.model || agent.model_provider || 'OpenAI'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-pixel-gray font-pixel-body">类型</span>
          <span className="font-pixel-body text-white">{agent.type || 'Assistant'}</span>
        </div>

        <div className="pt-3 border-t-4 border-border flex space-x-2">
          <button
            onClick={() => navigate('/logs')}
            className="flex-1 bg-bg-secondary hover:bg-bg-input text-white text-sm font-pixel-body py-2 border-4 border-border transition-colors"
          >
            日志
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex-1 bg-bg-secondary hover:bg-bg-input text-white text-sm font-pixel-body py-2 border-4 border-border transition-colors"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 relative pixel-scrollbar">
      {/* 像素图案背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pixel-pattern-bg opacity-20"></div>

      <div className="relative z-10">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-pixel-title text-white tracking-tight">仪表盘</h1>
              <p className="text-pixel-gray mt-1 font-pixel-body">AI 智能体网络概览</p>
            </div>
            {lastRefresh && (
              <div className="text-xs text-pixel-gray flex items-center space-x-2 font-pixel-body">
                <span className="w-2 h-2 bg-pixel-accent-green animate-pulse"></span>
                <span>最后更新: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="智能体总数"
            value={stats.totalAgents}
            subtext={stats.newAgentsThisWeek > 0 ? `本周新增 ${stats.newAgentsThisWeek} 个` : '暂无新增'}
            icon="🤖"
            color="bg-pixel-accent-cyan"
          />
          <StatCard
            title="当前在线"
            value={stats.activeAgents}
            subtext={`在线率 ${stats.onlineRate}%`}
            icon="🟢"
            color="bg-pixel-accent-green"
          />
          <StatCard
            title="今日消息"
            value={stats.todayMessages.toLocaleString()}
            subtext={stats.todayGrowth !== 0 ? `较昨日 ${stats.todayGrowth > 0 ? '+' : ''}${stats.todayGrowth}%` : '暂无对比数据'}
            icon="💬"
            color="bg-pixel-primary"
            trend={stats.todayGrowth}
          />
          <StatCard
            title="平均延迟"
            value={`${stats.avgLatency}ms`}
            subtext="API 响应时间"
            icon="⚡"
            color="bg-pixel-accent-orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MessageTrendChart data={trendData} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <AgentPerformancePanel data={performanceData} loading={loading} />
          </div>
        </div>

        <div className="mb-8">
          <ApiUsageChart
            data={apiUsageData.modelDistribution}
            totals={apiUsageData.totals}
            loading={loading}
          />
        </div>

        {/* Agent Grid Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-pixel-title text-white">活跃智能体</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-pixel-gray"></i>
                <input
                  type="text"
                  placeholder="搜索智能体..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors w-64 font-pixel-body"
                />
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="btn-primary text-white px-4 py-2 text-sm font-pixel-title flex items-center gap-2"
              >
                <i className="ri-add-line"></i>
                <span>新建智能体</span>
              </button>
            </div>
          </div>

          {agentsLoading || loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
              {filteredAgents.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-bg-card border-4 border-dashed border-border">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-pixel-title text-white">
                    {searchQuery ? '未找到匹配的智能体' : '未找到智能体'}
                  </h3>
                  <p className="text-pixel-gray mt-1 font-pixel-body">
                    {searchQuery ? '请尝试其他搜索词' : '请创建您的第一个 AI 智能体。'}
                  </p>
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
