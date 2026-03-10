import React from 'react';

export const RobotCard = ({ robot, onEdit, onNavigate, onDelete }) => (
  <div className="character-card p-5 border-4 border-border shadow-pixel-md hover:shadow-pixel-lg transition-shadow flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 border-4 flex items-center justify-center text-xl text-white shadow-pixel-sm ${
          robot.status === 'online'
            ? 'bg-pixel-accent-green border-pixel-accent-green/50'
            : 'bg-pixel-gray-dark border-border'
        }`}>
          {robot.avatar || '🤖'}
        </div>
        <div>
          <h4 className="font-pixel-body text-base text-white">{robot.name}</h4>
          <p className="text-xs text-pixel-gray mt-0.5 font-pixel-body">ID: {robot.id.substring(0, 8)}...</p>
        </div>
      </div>
      <div className={`w-2.5 h-2.5 ${robot.status === 'online' ? 'bg-pixel-accent-green online-indicator' : 'bg-pixel-gray'}`}></div>
    </div>

    <div className="space-y-3 flex-1">
      <div className="bg-bg-input p-3 border-4 border-border">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-pixel-gray font-pixel-body">模型</span>
          <span className="font-pixel-body text-white">{robot.model || robot.config?.model || 'Unknown'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-pixel-gray font-pixel-body">类型</span>
          <span className="font-pixel-body text-white">{robot.type || robot.provider_type || 'Assistant'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-pixel-gray font-pixel-body">
         <span>最后活跃:</span>
         <span>{robot.lastActive || '从未'}</span>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t-4 border-border grid grid-cols-3 gap-2">
      <button
        onClick={() => onEdit(robot)}
        className="px-3 py-2 bg-bg-secondary border-4 border-border text-xs font-pixel-title text-white hover:bg-bg-input transition-colors"
      >
        配置
      </button>
      <button
        onClick={() => onNavigate(robot)}
        className="px-3 py-2 bg-pixel-accent-purple/10 border-4 border-pixel-accent-purple/50 text-xs font-pixel-title text-pixel-accent-purple hover:bg-pixel-accent-purple/20 transition-colors"
      >
        🎭 角色卡
      </button>
      <button
        onClick={() => onDelete(robot)}
        className="px-3 py-2 bg-pixel-accent-pink/10 border-4 border-pixel-accent-pink/50 text-xs font-pixel-title text-pixel-accent-pink hover:bg-pixel-accent-pink/20 transition-colors"
      >
        删除
      </button>
    </div>
  </div>
);
