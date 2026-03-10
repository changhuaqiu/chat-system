import React from 'react';

/**
 * 上下文层级指示器 - 像素风格
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
      color: 'border-pixel-accent-purple bg-pixel-accent-purple',
      bgColor: 'bg-pixel-accent-purple/20',
      borderColor: 'border-pixel-accent-purple',
      description: '用户偏好、历史项目',
      count: global?.items?.length || 0
    },
    {
      id: 'room',
      name: '房间上下文',
      icon: 'ri-home-4-line',
      color: 'border-pixel-accent-cyan bg-pixel-accent-cyan',
      bgColor: 'bg-pixel-accent-cyan/20',
      borderColor: 'border-pixel-accent-cyan',
      description: '项目目标、已做决策',
      count: room?.items?.length || 0
    },
    {
      id: 'session',
      name: '会话记忆',
      icon: 'ri-file-list-3-line',
      color: 'border-pixel-accent-green bg-pixel-accent-green',
      bgColor: 'bg-pixel-accent-green/20',
      borderColor: 'border-pixel-accent-green',
      description: '任务状态、待办事项',
      count: session?.items?.length || 0
    },
    {
      id: 'conversation',
      name: '对话历史',
      icon: 'ri-chat-history-line',
      color: 'border-pixel-accent-orange bg-pixel-accent-orange',
      bgColor: 'bg-pixel-accent-orange/20',
      borderColor: 'border-pixel-accent-orange',
      description: '当前对话内容',
      count: conversation?.items?.length || 0
    }
  ];

  return (
    <div className="bg-bg-card p-4 border-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <i className="ri-stack-line text-pixel-accent-purple" />
        <span className="text-sm font-pixel-title text-white">上下文层级</span>
      </div>

      <div className="space-y-2">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`p-3 cursor-pointer transition-all ${
              currentLevel === level.id
                ? `${level.bgColor} border-4 ${level.borderColor}`
                : 'bg-bg-secondary border-4 border-border hover:border-pixel-border-light'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* 图标 */}
              <div className={`w-8 h-8 border-4 ${level.color} flex items-center justify-center`}>
                <i className={`${level.icon} text-white text-sm`} />
              </div>

              {/* 信息 */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-pixel-title text-white">{level.name}</span>
                  {level.count > 0 && (
                    <span className="text-xs text-pixel-gray font-pixel-body">{level.count} 项</span>
                  )}
                </div>
                <p className="text-xs text-pixel-gray font-pixel-body">{level.description}</p>
              </div>

              {/* 当前层级指示器 */}
              {currentLevel === level.id && (
                <div className="w-3 h-3 bg-pixel-accent-green border-2 border-pixel-accent-green animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextHierarchy;
