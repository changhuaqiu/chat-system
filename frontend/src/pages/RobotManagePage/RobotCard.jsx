import React from 'react';

export const RobotCard = ({ robot, onEdit, onNavigate, onDelete }) => (
  <div className="character-card p-5 rounded-2xl border border-white/10 hover:shadow-md transition-shadow duration-200 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white ${
          robot.status === 'online'
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg'
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          {robot.avatar || '🤖'}
        </div>
        <div>
          <h4 className="font-semibold text-white">{robot.name}</h4>
          <p className="text-xs text-white/40 mt-0.5">ID: {robot.id.substring(0, 8)}...</p>
        </div>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${robot.status === 'online' ? 'bg-emerald-500 online-indicator' : 'bg-gray-500'}`}></div>
    </div>

    <div className="space-y-3 flex-1">
      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/60">模型</span>
          <span className="font-medium text-white">{robot.model || robot.config?.model || 'Unknown'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/60">类型</span>
          <span className="font-medium text-white">{robot.type || robot.provider_type || 'Assistant'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-white/40">
         <span>最后活跃:</span>
         <span>{robot.lastActive || '从未'}</span>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
      <button
        onClick={() => onEdit(robot)}
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-colors"
      >
        配置
      </button>
      <button
        onClick={() => onNavigate(robot)}
        className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
      >
        🎭 角色卡
      </button>
      <button
        onClick={() => onDelete(robot)}
        className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
      >
        删除
      </button>
    </div>
  </div>
);
