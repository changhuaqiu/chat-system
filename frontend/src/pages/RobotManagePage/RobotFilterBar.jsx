import React from 'react';

export const RobotFilterBar = ({ filter, setFilter, searchQuery, setSearchQuery }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex space-x-2">
      <button
        onClick={() => setFilter('all')}
        className={`px-4 py-2 text-sm font-pixel-title transition-colors ${
          filter === 'all' ? 'btn-primary text-white' : 'text-pixel-gray border-4 border-transparent hover:border-border'
        }`}
      >
        所有机器人
      </button>
      <button
        onClick={() => setFilter('online')}
        className={`px-4 py-2 text-sm font-pixel-title transition-colors ${
          filter === 'online' ? 'btn-primary text-white' : 'text-pixel-gray border-4 border-transparent hover:border-border'
        }`}
      >
        在线
      </button>
      <button
        onClick={() => setFilter('offline')}
        className={`px-4 py-2 text-sm font-pixel-title transition-colors ${
          filter === 'offline' ? 'btn-primary text-white' : 'text-pixel-gray border-4 border-transparent hover:border-border'
        }`}
      >
        离线
      </button>
    </div>

    <div className="relative">
      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-pixel-gray"></i>
      <input
        type="text"
        placeholder="搜索机器人..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors w-64 font-pixel-body"
      />
    </div>
  </div>
);
