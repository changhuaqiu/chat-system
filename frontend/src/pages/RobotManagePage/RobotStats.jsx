import React from 'react';

export const RobotStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-bg-card p-5 border-4 border-border shadow-pixel-sm">
      <p className="text-xs font-pixel-title text-pixel-gray uppercase">智能体总数</p>
      <p className="text-2xl font-pixel-title text-white mt-1">{stats.total}</p>
    </div>
    <div className="bg-bg-card p-5 border-4 border-border shadow-pixel-sm">
      <p className="text-xs font-pixel-title text-pixel-gray uppercase">已部署</p>
      <p className="text-2xl font-pixel-title text-white mt-1">{stats.assigned}</p>
    </div>
    <div className="bg-pixel-accent-green/10 p-5 border-4 border-pixel-accent-green shadow-pixel-sm" style={{ boxShadow: '4px 4px 0 rgba(0, 255, 136, 0.3)' }}>
      <p className="text-xs font-pixel-title text-pixel-accent-green uppercase">在线</p>
      <p className="text-2xl font-pixel-title text-white mt-1">{stats.online}</p>
    </div>
    <div className="bg-bg-card p-5 border-4 border-border shadow-pixel-sm">
      <p className="text-xs font-pixel-title text-pixel-gray uppercase">离线</p>
      <p className="text-2xl font-pixel-title text-white mt-1">{stats.offline}</p>
    </div>
  </div>
);
