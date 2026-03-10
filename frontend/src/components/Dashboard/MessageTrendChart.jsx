/**
 * Message Trend Chart Component
 * Displays message count trends over time using Recharts
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const MessageTrendChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">消息趋势</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">消息趋势</h3>
        <div className="flex flex-col items-center justify-center h-64 text-white/40">
          <span className="text-3xl mb-2">📊</span>
          <p>暂无趋势数据</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">消息趋势</h3>
        <span className="text-xs text-white/40">近 7 天</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="messages"
            name="消息数"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMessages)"
          />
          <Area
            type="monotone"
            dataKey="botResponses"
            name="AI 回复"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBots)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MessageTrendChart;
