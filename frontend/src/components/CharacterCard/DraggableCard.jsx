import React from 'react';
import BotAvatar from '../BotAvatar';

/**
 * 可拖拽角色卡组件
 * 用于拖拽式角色分配
 */
const DraggableCard = ({ character, onDragStart, onDragEnd }) => {
  const {
    id,
    name,
    description,
    expertise = [],
    canWorkAs = [],
    status = 'active'
  } = character || {};

  const handleDragStart = (e) => {
    e.dataTransfer.setData('characterId', id);
    e.dataTransfer.setData('characterName', name);
    e.dataTransfer.setData('characterData', JSON.stringify(character));
    onDragStart && onDragStart(character);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`character-card p-4 rounded-xl cursor-grab active:cursor-grabbing
        hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]
        transition-all duration-300 bg-white/5 border border-white/10`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <BotAvatar botId={id || name} size="md" status={status === 'active' ? 'online' : 'idle'} />

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{name}</h4>
          <p className="text-xs text-white/40 truncate">{description || '暂无描述'}</p>

          {/* 可担任角色 */}
          {canWorkAs && canWorkAs.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {canWorkAs.map((role, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 拖拽指示器 */}
        <div className="flex-shrink-0 text-white/30">
          <i className="ri-drag-move-line text-lg" />
        </div>
      </div>
    </div>
  );
};

export default DraggableCard;
