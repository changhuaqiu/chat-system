import React from 'react';

export const RobotStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="glass-panel p-5 rounded-2xl border border-white/10">
      <p className="text-xs font-medium text-white/60 uppercase">智能体总数</p>
      <p className="text-2xl font-semibold text-white mt-1">{stats.total}</p>
    </div>
    <div className="glass-panel p-5 rounded-2xl border border-white/10">
      <p className="text-xs font-medium text-white/60 uppercase">已部署</p>
      <p className="text-2xl font-semibold text-white mt-1">{stats.assigned}</p>
    </div>
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
      <p className="text-xs font-medium text-emerald-400 uppercase">在线</p>
      <p className="text-2xl font-semibold text-white mt-1">{stats.online}</p>
    </div>
    <div className="glass-panel p-5 rounded-2xl border border-white/10">
      <p className="text-xs font-medium text-white/40 uppercase">离线</p>
      <p className="text-2xl font-semibold text-white mt-1">{stats.offline}</p>
    </div>
  </div>
);
