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

const COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#ff3b30', '#5856d6'];

const ApiUsageChart = ({ data = [], modelData = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">API 使用统计</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007aff]"></div>
        </div>
      </div>
    );
  }

  const hasData = (data && data.length > 0) || (modelData && modelData.length > 0);

  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">API 使用统计</h3>
        <div className="flex flex-col items-center justify-center h-64 text-[#86868b]">
          <span className="text-3xl mb-2">🔌</span>
          <p>暂无 API 使用数据</p>
        </div>
      </div>
    );
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#e5e5e5]">
          <p className="text-sm font-medium text-[#1d1d1f]">{payload[0].name}</p>
          <p className="text-sm text-[#007aff]">{payload[0].value.toLocaleString()} 次调用</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#e5e5e5]">
          <p className="text-sm font-medium text-[#1d1d1f]">{label}</p>
          <p className="text-sm text-[#007aff]">{payload[0].value.toLocaleString()} 次</p>
        </div>
      );
    }
    return null;
  };

  // Default pie data if not provided
  const pieData = data.length > 0 ? data : [
    { name: 'GPT-4', value: 4000 },
    { name: 'GPT-3.5', value: 3000 },
    { name: 'Claude', value: 2000 },
    { name: '其他', value: 1000 }
  ];

  // Default bar data if not provided
  const barData = modelData.length > 0 ? modelData : pieData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">API 使用统计</h3>
        <span className="text-xs text-[#86868b]">模型分布</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Model Distribution */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-xs text-[#1d1d1f]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Request Distribution */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#86868b' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#86868b' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" name="调用次数" fill="#007aff" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[#f5f5f7]">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#1d1d1f]">
            {pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </p>
          <p className="text-xs text-[#86868b]">总调用次数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#1d1d1f]">{pieData.length}</p>
          <p className="text-xs text-[#86868b]">模型数量</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#1d1d1f]">
            {pieData.length > 0 ? Math.round(pieData[0].value / (pieData.reduce((sum, item) => sum + item.value, 0) || 1) * 100) : 0}%
          </p>
          <p className="text-xs text-[#86868b]">主力模型占比</p>
        </div>
      </div>
    </div>
  );
};

export default ApiUsageChart;
