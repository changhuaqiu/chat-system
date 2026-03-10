/**
 * Agent Performance Panel Component - 像素风格
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

const COLORS = ['#8b5cf6', '#00ff88', '#f97316', '#f43f5e', '#00f3ff'];

const AgentPerformancePanel = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">Agent 性能排行</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">Agent 性能排行</h3>
        <div className="flex flex-col items-center justify-center h-64 text-pixel-gray">
          <span className="text-3xl mb-2">⚡</span>
          <p className="font-pixel-body">暂无性能数据</p>
        </div>
      </div>
    );
  }

  const topAgents = [...data]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const agent = data.find(a => a.name === label);
      return (
        <div className="bg-bg-card p-3 border-4 border-border">
          <p className="text-sm font-pixel-title text-white mb-2">{label}</p>
          <p className="text-sm text-pixel-accent-purple font-pixel-body">请求数: {payload[0].value.toLocaleString()}</p>
          {agent && (
            <>
              <p className="text-sm text-pixel-gray font-pixel-body">延迟: {agent.avgLatency || 0}ms</p>
              <p className="text-sm text-pixel-gray font-pixel-body">Token: {agent.totalTokens?.toLocaleString() || 0}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-bg-card p-6 border-4 border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-pixel-title text-white">Agent 性能排行</h3>
        <span className="text-xs text-pixel-gray font-pixel-body">按请求数排序</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={topAgents}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'VT323' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#ffffff', fontFamily: 'VT323' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="requestCount" radius={[0, 0, 0, 0]}>
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
                className="w-3 h-3 border-2"
                style={{ backgroundColor: COLORS[index], borderColor: COLORS[index] }}
              />
              <span className="text-white truncate max-w-24 font-pixel-body">{agent.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-pixel-gray font-pixel-body">
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
