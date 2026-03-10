/**
 * API Usage Chart Component - 像素风格
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#00ff88', '#f97316', '#f43f5e', '#00f3ff', '#6366f1'];

const ApiUsageChart = ({ data = [], totals = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">API 使用统计</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <div className="bg-bg-card p-6 border-4 border-border">
        <h3 className="text-lg font-pixel-title text-white mb-4">API 使用统计</h3>
        <div className="flex flex-col items-center justify-center h-64 text-pixel-gray">
          <span className="text-3xl mb-2">🔌</span>
          <p className="font-pixel-body">暂无 API 使用数据</p>
        </div>
      </div>
    );
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card p-3 border-4 border-border">
          <p className="text-sm font-pixel-title text-white">{payload[0].name}</p>
          <p className="text-sm text-pixel-accent-purple font-pixel-body">{payload[0].value.toLocaleString()} 次调用</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card p-3 border-4 border-border">
          <p className="text-sm font-pixel-title text-white">{label}</p>
          <p className="text-sm text-pixel-accent-purple font-pixel-body">{payload[0].value.toLocaleString()} 次</p>
        </div>
      );
    }
    return null;
  };

  const totalRequests = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-bg-card p-6 border-4 border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-pixel-title text-white">API 使用统计</h3>
        <span className="text-xs text-pixel-gray font-pixel-body">模型分布</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-xs text-pixel-gray font-pixel-body">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 6)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'VT323' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'VT323' }}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" name="调用次数" radius={[0, 0, 0, 0]}>
                {data.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t-4 border-border">
        <div className="text-center">
          <p className="text-2xl font-pixel-title text-white">
            {totalRequests.toLocaleString()}
          </p>
          <p className="text-xs text-pixel-gray font-pixel-body">总调用次数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-pixel-title text-white">{data.length}</p>
          <p className="text-xs text-pixel-gray font-pixel-body">模型数量</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-pixel-title text-white">
            {data.length > 0 ? Math.round((data[0].value / (totalRequests || 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-pixel-gray font-pixel-body">主力模型占比</p>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageChart;
