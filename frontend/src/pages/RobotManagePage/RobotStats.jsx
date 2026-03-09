import React from 'react';

export const RobotStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
      <p className="text-xs font-medium text-[#86868b] uppercase">智能体总数</p>
      <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.total}</p>
    </div>
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
      <p className="text-xs font-medium text-[#86868b] uppercase">已部署</p>
      <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.assigned}</p>
    </div>
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
      <p className="text-xs font-medium text-green-600 uppercase">在线</p>
      <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.online}</p>
    </div>
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase">离线</p>
      <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.offline}</p>
    </div>
  </div>
);
