/**
 * Agent Performance Panel Component
 * Displays Agent performance metrics and rankings
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];

const AgentPerformancePanel = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Agent 性能排行</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Agent 性能排行</h3>
        <div className="flex flex-col items-center justify-center h-64 text-white/40">
          <span className="text-3xl mb-2">⚡</span>
          <p>暂无性能数据</p>
        </div>
      </div>
    );
  }

  // Sort by request count and take top 5
  const topAgents = [...data]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const agent = data.find(a => a.name === label);
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          <p className="text-sm text-purple-400">请求数: {payload[0].value.toLocaleString()}</p>
          {agent && (
            <>
              <p className="text-sm text-white/60">延迟: {agent.avgLatency || 0}ms</p>
              <p className="text-sm text-white/60">Token: {agent.totalTokens?.toLocaleString() || 0}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Agent 性能排行</h3>
        <span className="text-xs text-white/40">按请求数排序</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={topAgents}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.8)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="requestCount" radius={[0, 4, 4, 0]}>
            {topAgents.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Performance details */}
      <div className="mt-4 space-y-2">
        {topAgents.slice(0, 3).map((agent, index) => (
          <div key={agent.id || index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-white truncate max-w-24">{agent.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-white/60">
              <span>{agent.avgLatency || 0}ms</span>
              <span>{agent.requestCount?.toLocaleString() || 0} 次</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentPerformancePanel;
