/**
 * Dashboard Page
 *
 * Enhanced dashboard with:
 * - Real-time data refresh (30s polling)
 * - Message trend charts
 * - Agent performance metrics
 * - API usage statistics
 * - Search/filter functionality
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

// Refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL = 30000;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading, refreshAgents } = useAgents();

  // State
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

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Fetch all data in parallel
      const [dashboardStats, trendResponse, performanceResponse, apiUsageResponse] = await Promise.all([
        apiService.getDashboardStats().catch(() => null),
        apiService.getMessageTrend(7).catch(() => ({ data: [] })),
        apiService.getAgentPerformance(10).catch(() => ({ data: [] })),
        apiService.getApiUsage(7).catch(() => ({ modelDistribution: [], totals: {} }))
      ]);

      // Update stats
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
        // Fallback: calculate from agents
        const active = agents.filter(a => a.status === 'active' || a.status === 'online').length;
        setStats(prev => ({
          ...prev,
          totalAgents: agents.length,
          activeAgents: active,
          onlineRate: agents.length > 0 ? Math.round((active / agents.length) * 100) : 0
        }));
      }

      // Update trend data
      setTrendData(trendResponse.data || []);

      // Update performance data
      setPerformanceData(performanceResponse.data || []);

      // Update API usage data
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

  // Initial load and refresh agents
  useEffect(() => {
    refreshAgents();
    fetchDashboardData(true);
  }, []);

  // Polling for auto-refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  // Filter agents by search query
  const filteredAgents = agents.filter(agent => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (agent.name && agent.name.toLowerCase().includes(query)) ||
      (agent.description && agent.description.toLowerCase().includes(query))
    );
  });

  // Stat Card Component
  const StatCard = ({ title, value, subtext, icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[#86868b]">{title}</p>
          <h3 className="text-3xl font-semibold text-[#1d1d1f] mt-2">{value}</h3>
          {subtext && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-[#86868b]'}`}>
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Agent Card Component
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
          <button
            onClick={() => navigate('/logs')}
            className="flex-1 bg-[#f5f5f7] hover:bg-[#e5e5e5] text-[#1d1d1f] text-sm font-medium py-2 rounded-lg transition-colors"
          >
            日志
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex-1 bg-[#f5f5f7] hover:bg-[#e5e5e5] text-[#1d1d1f] text-sm font-medium py-2 rounded-lg transition-colors"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 font-apple">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">仪表盘</h1>
            <p className="text-[#86868b] mt-1">AI 智能体网络概览</p>
          </div>
          {lastRefresh && (
            <div className="text-xs text-[#86868b] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
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
          color="bg-blue-500"
        />
        <StatCard
          title="当前在线"
          value={stats.activeAgents}
          subtext={`在线率 ${stats.onlineRate}%`}
          icon="🟢"
          color="bg-green-500"
        />
        <StatCard
          title="今日消息"
          value={stats.todayMessages.toLocaleString()}
          subtext={stats.todayGrowth !== 0 ? `较昨日 ${stats.todayGrowth > 0 ? '+' : ''}${stats.todayGrowth}%` : '暂无对比数据'}
          icon="💬"
          color="bg-indigo-500"
          trend={stats.todayGrowth}
        />
        <StatCard
          title="平均延迟"
          value={`${stats.avgLatency}ms`}
          subtext="API 响应时间"
          icon="⚡"
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Message Trend Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <MessageTrendChart data={trendData} loading={loading} />
        </div>

        {/* Agent Performance Panel */}
        <div className="lg:col-span-1">
          <AgentPerformancePanel data={performanceData} loading={loading} />
        </div>
      </div>

      {/* API Usage Chart */}
      <div className="mb-8">
        <ApiUsageChart
          data={apiUsageData.modelDistribution}
          modelData={apiUsageData.modelDistribution}
          loading={loading}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all w-64"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-[#007aff] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              + 新建智能体
            </button>
          </div>
        </div>

        {agentsLoading || loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007aff]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
            {filteredAgents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-[#1d1d1f]">
                  {searchQuery ? '未找到匹配的智能体' : '未找到智能体'}
                </h3>
                <p className="text-[#86868b] mt-1">
                  {searchQuery ? '请尝试其他搜索词' : '请创建您的第一个 AI 智能体。'}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
