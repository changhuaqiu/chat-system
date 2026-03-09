import React from 'react';

export const OneApiStatusBar = ({ oneApiStatus }) => {
  const getOneApiBadge = () => {
    if (!oneApiStatus.configured) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          One-API: 未配置
        </span>
      );
    }
    if (oneApiStatus.healthy) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
          One-API: 已连接
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        One-API: 连接异常
      </span>
    );
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-[#1d1d1f]">One-API 集成状态:</span>
        {getOneApiBadge()}
      </div>
      <div className="text-xs text-[#86868b]">
        {oneApiStatus.configured ? `地址：${oneApiStatus.baseUrl}` : '请在 .env 文件中配置 ONE_API_BASE_URL 和 ONE_API_ROOT_TOKEN'}
      </div>
    </div>
  );
};
