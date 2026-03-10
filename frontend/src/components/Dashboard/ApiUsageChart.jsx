/**
 * API Usage Chart Component
 * Displays API usage statistics with pie chart and bar chart
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

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#6366f1'];

const ApiUsageChart = ({ data = [], totals = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">API 使用统计</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">API 使用统计</h3>
        <div className="flex flex-col items-center justify-center h-64 text-white/40">
          <span className="text-3xl mb-2">🔌</span>
          <p>暂无 API 使用数据</p>
        </div>
      </div>
    );
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10">
          <p className="text-sm font-medium text-white">{payload[0].name}</p>
          <p className="text-sm text-purple-400">{payload[0].value.toLocaleString()} 次调用</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-sm text-purple-400">{payload[0].value.toLocaleString()} 次</p>
        </div>
      );
    }
    return null;
  };

  const totalRequests = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">API 使用统计</h3>
        <span className="text-xs text-white/40">模型分布</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Model Distribution */}
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
                  <span className="text-xs text-white/80">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Request Distribution */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 6)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" name="调用次数" radius={[4, 4, 0, 0]}>
                {data.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white">
            {totalRequests.toLocaleString()}
          </p>
          <p className="text-xs text-white/40">总调用次数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-white">{data.length}</p>
          <p className="text-xs text-white/40">模型数量</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-white">
            {data.length > 0 ? Math.round((data[0].value / (totalRequests || 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-white/40">主力模型占比</p>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageChart;
