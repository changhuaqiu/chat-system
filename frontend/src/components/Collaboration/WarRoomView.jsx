import React from 'react';

/**
 * 作战室模式视图
 * 特点：任务看板、角色分配、进度跟踪
 */
const WarRoomView = ({ children, roomInfo, members }) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部信息栏 - 显示任务进度 */}
        <div className="glass-panel border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <i className="ri-sword-line text-red-400" />
                {roomInfo?.name || '作战室'}
              </h2>
              <p className="text-sm text-white/40 mt-1">
                {roomInfo?.description || '任务执行模式'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 任务进度 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">任务进度</span>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                </div>
                <span className="text-sm text-white/80">60%</span>
              </div>
            </div>
          </div>

          {/* 任务看板缩略 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-400">进行中 3</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-400">已完成 5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-400">待办 2</span>
            </div>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* 右侧：角色分配面板 */}
      <div className="w-72 border-l border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <i className="ri-team-line text-red-400" />
            角色分配
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {/* Leader 角色 */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <i className="ri-crown-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">Leader</span>
                <p className="text-xs text-white/40">任务协调者</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white font-medium">
                邱
              </div>
              <span className="text-xs text-white/70">邱总</span>
            </div>
          </div>

          {/* Worker 角色 */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <i className="ri-code-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">后端开发</span>
                <p className="text-xs text-white/40">API 实现</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-xs text-white font-medium">
                <i className="ri-robot-line" />
              </div>
              <span className="text-xs text-white/70">dev-backend</span>
            </div>
          </div>

          {/* UX 设计角色 */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <i className="ri-palette-line text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">UX 设计</span>
                <p className="text-xs text-white/40">界面设计</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs text-white font-medium">
                <i className="ri-robot-line" />
              </div>
              <span className="text-xs text-white/70">ux-design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarRoomView;
