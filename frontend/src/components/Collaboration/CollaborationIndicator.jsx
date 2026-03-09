import React from 'react';

/**
 * 协作指示器
 * 显示机器人思考中、并发响应等状态
 */
const CollaborationIndicator = ({ thinkingBots = [], respondingBots = [], taskChain = [] }) => {
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-radar-line text-purple-400" />
        <span className="text-sm font-medium text-white/80">协作状态</span>
      </div>

      {/* 思考中的机器人 */}
      {thinkingBots.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <div className="typing-dot w-2 h-2 bg-amber-400 rounded-full" />
              <div className="typing-dot w-2 h-2 bg-amber-400 rounded-full delay-100" />
              <div className="typing-dot w-2 h-2 bg-amber-400 rounded-full delay-200" />
            </div>
            <span className="text-xs text-amber-400">思考中</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {thinkingBots.map((bot) => (
              <div
                key={bot.id}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-xs text-white">
                  {bot.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <span className="text-xs text-amber-300">{bot.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 响应中的机器人 */}
      {respondingBots.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-send-plane-fill text-emerald-400 text-xs" />
            <span className="text-xs text-emerald-400">正在发送</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {respondingBots.map((bot) => (
              <div
                key={bot.id}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs text-white">
                  {bot.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <span className="text-xs text-emerald-300">{bot.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 任务委派链路 */}
      {taskChain.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-flow-chart text-blue-400 text-xs" />
            <span className="text-xs text-blue-400">任务链路</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {taskChain.map((step, idx) => (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <i className="ri-arrow-right-s-line text-white/30 text-xs flex-shrink-0" />
                )}
                <div
                  className={`px-3 py-1.5 rounded-lg border flex-shrink-0 flex items-center gap-2 ${
                    step.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : step.status === 'current'
                      ? 'bg-blue-500/10 border-blue-500/30 animate-pulse'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                      step.assignee?.type === 'coordinator'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-gradient-to-br from-purple-500 to-violet-500'
                    } text-white`}
                  >
                    {step.assignee?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <span
                    className={`text-xs ${
                      step.status === 'completed'
                        ? 'text-emerald-300'
                        : step.status === 'current'
                        ? 'text-blue-300'
                        : 'text-white/50'
                    }`}
                  >
                    {step.action}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {thinkingBots.length === 0 && respondingBots.length === 0 && taskChain.length === 0 && (
        <div className="text-center py-4">
          <i className="ri-checkbox-circle-line text-emerald-400 text-2xl mb-2" />
          <p className="text-sm text-white/50">所有任务已完成</p>
        </div>
      )}
    </div>
  );
};

export default CollaborationIndicator;
