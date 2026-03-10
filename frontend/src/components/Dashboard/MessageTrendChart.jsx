/**
 * Message Trend Chart Component - 像素风格
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
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">消息趋势</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">消息趋势</h3>
        <div className="flex flex-col items-center justify-center h-64 text-pixel-gray">
          <span className="text-3xl mb-2">📊</span>
          <p className="font-pixel-body">暂无趋势数据</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card p-3 border-4 border-border">
          <p className="text-sm font-pixel-title text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-pixel-body" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-bg-card p-6 border-4 border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-pixel-title text-white">消息趋势</h3>
        <span className="text-xs text-pixel-gray font-pixel-body">近 7 天</span>
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
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'VT323' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'VT323' }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
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
            stroke="#00ff88"
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
