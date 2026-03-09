import React from 'react';

export const OneApiStatusBar = ({ oneApiStatus }) => {
  const getOneApiBadge = () => {
    if (!oneApiStatus.configured) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/40">
          One-API: 未配置
        </span>
      );
    }
    if (oneApiStatus.healthy) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 online-indicator"></span>
          One-API: 已连接
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
        One-API: 连接异常
      </span>
    );
  };

  return (
    <div className="mb-6 glass-panel p-4 rounded-2xl border border-white/10 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-white">One-API 集成状态:</span>
        {getOneApiBadge()}
      </div>
      <div className="text-xs text-white/40">
        {oneApiStatus.configured ? `地址：${oneApiStatus.baseUrl}` : '请在 .env 文件中配置 ONE_API_BASE_URL 和 ONE_API_ROOT_TOKEN'}
      </div>
    </div>
  );
};
