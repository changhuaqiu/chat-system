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

const COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#ff3b30'];

const AgentPerformancePanel = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Agent 性能排行</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007aff]"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Agent 性能排行</h3>
        <div className="flex flex-col items-center justify-center h-64 text-[#86868b]">
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#e5e5e5]">
          <p className="text-sm font-medium text-[#1d1d1f] mb-2">{label}</p>
          <p className="text-sm text-[#007aff]">请求数: {payload[0].value.toLocaleString()}</p>
          {agent && (
            <>
              <p className="text-sm text-[#86868b]">延迟: {agent.avgLatency || 0}ms</p>
              <p className="text-sm text-[#86868b]">Token: {agent.totalTokens?.toLocaleString() || 0}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">Agent 性能排行</h3>
        <span className="text-xs text-[#86868b]">按请求数排序</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={topAgents}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#86868b' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#1d1d1f' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
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
              <span className="text-[#1d1d1f] truncate max-w-24">{agent.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-[#86868b]">
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
