import React from 'react';

export const RobotFilterBar = ({ filter, setFilter, searchQuery, setSearchQuery }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex space-x-2">
      <button
        onClick={() => setFilter('all')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'all' ? 'btn-primary text-white' : 'text-white/70 hover:bg-white/10'
        }`}
      >
        所有机器人
      </button>
      <button
        onClick={() => setFilter('online')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'online' ? 'btn-primary text-white' : 'text-white/70 hover:bg-white/10'
        }`}
      >
        在线
      </button>
      <button
        onClick={() => setFilter('offline')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filter === 'offline' ? 'btn-primary text-white' : 'text-white/70 hover:bg-white/10'
        }`}
      >
        离线
      </button>
    </div>

    <div className="relative">
      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30"></i>
      <input
        type="text"
        placeholder="搜索机器人..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all w-64"
      />
    </div>
  </div>
);
