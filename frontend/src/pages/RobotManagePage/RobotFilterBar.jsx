import React from 'react';

export const RobotFilterBar = ({ filter, setFilter, searchQuery, setSearchQuery }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex space-x-2">
      <button
        onClick={() => setFilter('all')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'all' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
        }`}
      >
        所有机器人
      </button>
      <button
        onClick={() => setFilter('online')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'online' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
        }`}
      >
        在线
      </button>
      <button
        onClick={() => setFilter('offline')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'offline' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
        }`}
      >
        离线
      </button>
    </div>

    <div className="relative">
      <input
        type="text"
        placeholder="搜索机器人..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all w-64"
      />
      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
    </div>
  </div>
);
