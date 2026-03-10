import React from 'react';

export const OneApiStatusBar = ({ oneApiStatus }) => {
  const getOneApiBadge = () => {
    if (!oneApiStatus.configured) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-pixel-title bg-bg-secondary text-pixel-gray border-2 border-border">
          One-API: 未配置
        </span>
      );
    }
    if (oneApiStatus.healthy) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-pixel-title bg-pixel-accent-green/20 text-pixel-accent-green border-2 border-pixel-accent-green">
          <span className="w-1.5 h-1.5 bg-pixel-accent-green mr-1 online-indicator"></span>
          One-API: 已连接
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-pixel-title bg-pixel-accent-orange/20 text-pixel-accent-orange border-2 border-pixel-accent-orange">
        One-API: 连接异常
      </span>
    );
  };

  return (
    <div className="mb-6 bg-bg-card p-4 border-4 border-border flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-pixel-title text-white">One-API 集成状态:</span>
        {getOneApiBadge()}
      </div>
      <div className="text-xs text-pixel-gray font-pixel-body">
        {oneApiStatus.configured ? `地址：${oneApiStatus.baseUrl}` : '请在 .env 文件中配置 ONE_API_BASE_URL 和 ONE_API_ROOT_TOKEN'}
      </div>
    </div>
  );
};
