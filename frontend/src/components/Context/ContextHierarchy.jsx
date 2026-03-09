import React from 'react';

/**
 * 上下文层级指示器
 * 展示四层上下文层级（全局→房间→会话→对话）
 */
const ContextHierarchy = ({ currentLevel = 'room', contexts = {} }) => {
  const {
    global,
    room,
    session,
    conversation
  } = contexts;

  const levels = [
    {
      id: 'global',
      name: '全局记忆',
      icon: 'ri-global-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      description: '用户偏好、历史项目',
      count: global?.items?.length || 0
    },
    {
      id: 'room',
      name: '房间上下文',
      icon: 'ri-home-4-line',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      description: '项目目标、已做决策',
      count: room?.items?.length || 0
    },
    {
      id: 'session',
      name: '会话记忆',
      icon: 'ri-file-list-3-line',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      description: '任务状态、待办事项',
      count: session?.items?.length || 0
    },
    {
      id: 'conversation',
      name: '对话历史',
      icon: 'ri-chat-history-line',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      description: '当前对话内容',
      count: conversation?.items?.length || 0
    }
  ];

  return (
    <div className="glass-panel rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <i className="ri-stack-line text-purple-400" />
        <span className="text-sm font-semibold text-white">上下文层级</span>
      </div>

      <div className="space-y-2">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`context-layer p-3 rounded-xl cursor-pointer transition-all ${
              currentLevel === level.id
                ? `${level.bgColor} ${level.borderColor} border`
                : 'bg-white/5 border border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* 图标 */}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${level.color} bg-opacity-20 flex items-center justify-center`}>
                <i className={`${level.icon} text-white text-sm`} />
              </div>

              {/* 信息 */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{level.name}</span>
                  {level.count > 0 && (
                    <span className="text-xs text-white/40">{level.count} 项</span>
                  )}
                </div>
                <p className="text-xs text-white/40">{level.description}</p>
              </div>

              {/* 当前层级指示器 */}
              {currentLevel === level.id && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextHierarchy;
