import React from 'react';

/**
 * 协作指示器 - 像素风格
 * 显示机器人思考中、并发响应等状态
 */
const CollaborationIndicator = ({ thinkingBots = [], respondingBots = [], taskChain = [] }) => {
  return (
    <div className="bg-bg-card border-4 border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-radar-line text-pixel-accent-purple" />
        <span className="text-sm font-pixel-title text-white">协作状态</span>
      </div>

      {/* 思考中的机器人 */}
      {thinkingBots.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pixel-accent-orange animate-pulse" />
              <div className="w-2 h-2 bg-pixel-accent-orange animate-pulse delay-100" />
              <div className="w-2 h-2 bg-pixel-accent-orange animate-pulse delay-200" />
            </div>
            <span className="text-xs text-pixel-accent-orange font-pixel-body">思考中</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {thinkingBots.map((bot) => (
              <div
                key={bot.id}
                className="px-3 py-1.5 border-4 border-pixel-accent-orange bg-pixel-accent-orange/20 flex items-center gap-2"
              >
                <div className="w-5 h-5 border-4 border-pixel-accent-purple bg-pixel-accent-purple flex items-center justify-center text-xs text-white">
                  {bot.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <span className="text-xs text-pixel-accent-orange font-pixel-body">{bot.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 响应中的机器人 */}
      {respondingBots.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-send-plane-fill text-pixel-accent-green text-xs" />
            <span className="text-xs text-pixel-accent-green font-pixel-body">正在发送</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {respondingBots.map((bot) => (
              <div
                key={bot.id}
                className="px-3 py-1.5 border-4 border-pixel-accent-green bg-pixel-accent-green/20 flex items-center gap-2"
              >
                <div className="w-5 h-5 border-4 border-pixel-accent-green bg-pixel-accent-green flex items-center justify-center text-xs text-white">
                  {bot.name?.[0]?.toUpperCase() || 'B'}
                </div>
                <span className="text-xs text-pixel-accent-green font-pixel-body">{bot.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 任务委派链路 */}
      {taskChain.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-flow-chart text-pixel-accent-cyan text-xs" />
            <span className="text-xs text-pixel-accent-cyan font-pixel-body">任务链路</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {taskChain.map((step, idx) => (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <i className="ri-arrow-right-s-line text-pixel-gray text-xs flex-shrink-0" />
                )}
                <div
                  className={`px-3 py-1.5 border-4 flex-shrink-0 flex items-center gap-2 ${
                    step.status === 'completed'
                      ? 'border-pixel-accent-green bg-pixel-accent-green/20'
                      : step.status === 'current'
                      ? 'border-pixel-accent-cyan bg-pixel-accent-cyan/20 animate-pulse'
                      : 'border-border bg-bg-secondary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-4 flex items-center justify-center text-xs ${
                      step.assignee?.type === 'coordinator'
                        ? 'border-pixel-accent-orange bg-pixel-accent-orange'
                        : 'border-pixel-accent-purple bg-pixel-accent-purple'
                    } text-white`}
                  >
                    {step.assignee?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <span
                    className={`text-xs font-pixel-body ${
                      step.status === 'completed'
                        ? 'text-pixel-accent-green'
                        : step.status === 'current'
                        ? 'text-pixel-accent-cyan'
                        : 'text-pixel-gray'
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
          <i className="ri-checkbox-circle-line text-pixel-accent-green text-2xl mb-2" />
          <p className="text-sm text-pixel-gray font-pixel-body">所有任务已完成</p>
        </div>
      )}
    </div>
  );
};

export default CollaborationIndicator;
