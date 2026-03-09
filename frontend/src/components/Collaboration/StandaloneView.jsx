import React from 'react';

/**
 * 独立模式视图
 * 特点：简洁一对一界面、专注对话
 */
const StandaloneView = ({ children, roomInfo, members }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
      {/* 顶部信息栏 - 简洁显示 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 机器人 Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg glow-pulse">
              <i className="ri-robot-line text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {roomInfo?.name || '独立对话'}
              </h2>
              <p className="text-sm text-white/40 mt-1">
                {roomInfo?.description || '一对一专业咨询'}
              </p>
            </div>
          </div>
          {/* 状态指示器 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 online-indicator" />
            <span className="text-sm text-emerald-400">在线</span>
          </div>
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default StandaloneView;
