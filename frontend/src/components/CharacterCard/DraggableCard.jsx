import React from 'react';
import BotAvatar from '../BotAvatar';

/**
 * 可拖拽角色卡组件 - 像素风格
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
      className={`character-card p-4 cursor-grab active:cursor-grabbing
        hover:border-pixel-accent-purple hover:shadow-pixel-md
        transition-colors bg-bg-secondary border-4 border-border`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <BotAvatar botId={id || name} size="md" status={status === 'active' ? 'online' : 'idle'} />

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-pixel-title text-white truncate">{name}</h4>
          <p className="text-xs text-pixel-gray truncate font-pixel-body">{description || '暂无描述'}</p>

          {/* 可担任角色 */}
          {canWorkAs && canWorkAs.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {canWorkAs.map((role, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 border-2 border-pixel-accent-purple bg-pixel-accent-purple/20 text-pixel-accent-purple text-[10px] font-pixel-body"
                >
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 拖拽指示器 */}
        <div className="flex-shrink-0 text-pixel-gray">
          <i className="ri-drag-move-line text-lg" />
        </div>
      </div>
    </div>
  );
};

export default DraggableCard;
