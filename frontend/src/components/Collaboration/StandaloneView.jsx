import React from 'react';

/**
 * 独立模式视图 - 像素风格
 * 特点：简洁一对一界面、专注对话
 */
const StandaloneView = ({ children, roomInfo, members }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
      {/* 顶部信息栏 - 简洁显示 */}
      <div className="bg-bg-card border-b-4 border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 机器人 Avatar */}
            <div className="w-12 h-12 border-4 border-pixel-accent-green bg-pixel-accent-green flex items-center justify-center shadow-pixel-md">
              <i className="ri-robot-line text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-pixel-title text-white">
                {roomInfo?.name || '独立对话'}
              </h2>
              <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
                {roomInfo?.description || '一对一专业咨询'}
              </p>
            </div>
          </div>
          {/* 状态指示器 */}
          <div className="flex items-center gap-2 px-4 py-2 border-4 border-pixel-accent-green bg-pixel-accent-green/20">
            <div className="w-3 h-3 bg-pixel-accent-green border-2 border-pixel-accent-green" />
            <span className="text-sm text-pixel-accent-green font-pixel-body">在线</span>
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
