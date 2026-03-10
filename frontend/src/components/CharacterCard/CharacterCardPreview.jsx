import React from 'react';
import BotAvatar from '../BotAvatar';

/**
 * 角色卡预览组件 - 像素风格
 */
const CharacterCardPreview = ({ character, onClick, isSelected }) => {
  const {
    id,
    name,
    description,
    avatar,
    expertise = [],
    canWorkAs = [],
    collaborationSkills = [],
    status = 'active'
  } = character || {};

  const getTagStyle = (tag) => {
    const tagStyles = {
      coding: 'tag-expertise',
      api_design: 'tag-expertise',
      database: 'tag-expertise',
      system_design: 'tag-expertise',
      design: 'tag-role',
      ui: 'tag-role',
      prototyping: 'tag-role',
      management: 'tag-role',
      coordination: 'tag-role',
      task_execution: 'tag-skill',
      code_review: 'tag-skill',
      technical_advice: 'tag-skill',
      analysis: 'tag-skill',
      statistics: 'tag-skill'
    };
    return tagStyles[tag] || 'tag-expertise';
  };

  return (
    <div
      className={`character-card p-5 cursor-pointer transition-all border-4 ${
        isSelected ? 'border-pixel-accent-purple bg-pixel-accent-purple/10 shadow-pixel-sm' : 'border-border hover:border-pixel-border-light'
      }`}
      onClick={() => onClick && onClick(character)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <BotAvatar botId={id || name} size="lg" status={status === 'active' ? 'online' : 'idle'} />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {/* 名称和状态 */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-pixel-body text-base text-white">{name}</h3>
            <span
              className={`px-2 py-0.5 text-xs font-pixel-title border-2 ${
                status === 'active'
                  ? 'bg-pixel-accent-green/20 text-pixel-accent-green border-pixel-accent-green'
                  : 'bg-bg-secondary text-pixel-gray border-border'
              }`}
            >
              {status === 'active' ? '活跃' : '草稿'}
            </span>
          </div>

          {/* 描述 */}
          <p className="text-sm text-pixel-gray line-clamp-2 mb-3 font-pixel-body">
            {description || '暂无描述'}
          </p>

          {/* 专长标签 */}
          {expertise && expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expertise.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className={`${getTagStyle(tag)} px-2 py-0.5 text-xs font-pixel-body`}
                >
                  {tag}
                </span>
              ))}
              {expertise.length > 5 && (
                <span className="px-2 py-0.5 text-xs text-pixel-gray font-pixel-body">
                  +{expertise.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCardPreview;
