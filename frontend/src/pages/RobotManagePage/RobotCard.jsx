import React from 'react';

export const RobotCard = ({ robot, onEdit, onNavigate, onDelete }) => (
  <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] hover:shadow-md transition-shadow duration-200 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white ${
          robot.status === 'online'
            ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200'
            : 'bg-gradient-to-br from-gray-400 to-gray-600'
        }`}>
          {robot.avatar || '🤖'}
        </div>
        <div>
          <h4 className="font-semibold text-[#1d1d1f]">{robot.name}</h4>
          <p className="text-xs text-[#86868b] mt-0.5">ID: {robot.id.substring(0, 8)}...</p>
        </div>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${robot.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
    </div>

    <div className="space-y-3 flex-1">
      <div className="bg-[#f5f5f7] rounded-lg p-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#86868b]">模型</span>
          <span className="font-medium text-[#1d1d1f]">{robot.model || robot.config?.model || 'Unknown'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#86868b]">类型</span>
          <span className="font-medium text-[#1d1d1f]">{robot.type || robot.provider_type || 'Assistant'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-[#86868b]">
         <span>最后活跃:</span>
         <span>{robot.lastActive || '从未'}</span>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-[#f5f5f7] grid grid-cols-3 gap-2">
      <button
        onClick={() => onEdit(robot)}
        className="px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
      >
        配置
      </button>
      <button
        onClick={() => onNavigate(robot)}
        className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
      >
        🎭 角色卡
      </button>
      <button
        onClick={() => onDelete(robot)}
        className="px-3 py-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        删除
      </button>
    </div>
  </div>
);
