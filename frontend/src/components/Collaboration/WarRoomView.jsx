import React from 'react';

/**
 * 作战室模式视图 - 像素风格
 * 特点：任务看板、角色分配、进度跟踪
 */
const WarRoomView = ({ children, roomInfo, members }) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部信息栏 - 显示任务进度 */}
        <div className="bg-bg-card border-b-4 border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-pixel-title text-white flex items-center gap-2">
                <i className="ri-sword-line text-pixel-accent-pink" />
                {roomInfo?.name || '作战室'}
              </h2>
              <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
                {roomInfo?.description || '任务执行模式'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 任务进度 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-pixel-gray font-pixel-body">任务进度</span>
                <div className="w-32 h-4 bg-bg-secondary border-4 border-border overflow-hidden">
                  <div className="h-full w-3/5 bg-pixel-accent-orange" style={{ imageRendering: 'pixelated' }} />
                </div>
                <span className="text-sm text-white font-pixel-title">60%</span>
              </div>
            </div>
          </div>

          {/* 任务看板缩略 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 border-4 border-pixel-accent-pink bg-pixel-accent-pink/20">
              <div className="w-3 h-3 bg-pixel-accent-pink" />
              <span className="text-xs text-pixel-accent-pink font-pixel-body">进行中 3</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border-4 border-pixel-accent-green bg-pixel-accent-green/20">
              <div className="w-3 h-3 bg-pixel-accent-green" />
              <span className="text-xs text-pixel-accent-green font-pixel-body">已完成 5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border-4 border-border bg-bg-secondary">
              <div className="w-3 h-3 bg-pixel-gray" />
              <span className="text-xs text-pixel-gray font-pixel-body">待办 2</span>
            </div>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* 右侧：角色分配面板 */}
      <div className="w-72 border-l-4 border-border flex flex-col bg-bg-card">
        <div className="p-4 border-b-4 border-border">
          <h3 className="text-sm font-pixel-title text-white flex items-center gap-2">
            <i className="ri-team-line text-pixel-accent-pink" />
            角色分配
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {/* Leader 角色 */}
          <div className="p-3 border-4 border-pixel-accent-orange bg-pixel-accent-orange/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 border-4 border-pixel-accent-orange bg-pixel-accent-orange flex items-center justify-center">
                <i className="ri-crown-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-pixel-title text-white">Leader</span>
                <p className="text-xs text-pixel-gray font-pixel-body">任务协调者</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-pixel-accent-orange bg-pixel-accent-orange flex items-center justify-center text-xs text-white font-pixel-title">
                邱
              </div>
              <span className="text-xs text-white font-pixel-body">邱总</span>
            </div>
          </div>

          {/* Worker 角色 */}
          <div className="p-3 border-4 border-border bg-bg-secondary">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 border-4 border-pixel-primary bg-pixel-primary flex items-center justify-center">
                <i className="ri-code-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-pixel-title text-white">后端开发</span>
                <p className="text-xs text-pixel-gray font-pixel-body">API 实现</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-pixel-accent-purple bg-pixel-accent-purple flex items-center justify-center text-xs text-white">
                <i className="ri-robot-line" />
              </div>
              <span className="text-xs text-white font-pixel-body">dev-backend</span>
            </div>
          </div>

          {/* UX 设计角色 */}
          <div className="p-3 border-4 border-border bg-bg-secondary">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 border-4 border-pixel-accent-pink bg-pixel-accent-pink flex items-center justify-center">
                <i className="ri-palette-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-pixel-title text-white">UX 设计</span>
                <p className="text-xs text-pixel-gray font-pixel-body">界面设计</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-pixel-accent-green bg-pixel-accent-green flex items-center justify-center text-xs text-white">
                <i className="ri-robot-line" />
              </div>
              <span className="text-xs text-white font-pixel-body">ux-design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarRoomView;
