import React from 'react';
import BotAvatar from '../BotAvatar';

/**
 * 角色卡预览组件
 * 用于在列表中展示角色卡摘要信息
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

  // 获取专长标签样式
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
      className={`character-card p-5 rounded-2xl cursor-pointer transition-all ${
        isSelected ? 'border-purple-500/50 bg-purple-500/10' : ''
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
            <h3 className="font-semibold text-white">{name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {status === 'active' ? '活跃' : '草稿'}
            </span>
          </div>

          {/* 描述 */}
          <p className="text-sm text-white/50 line-clamp-2 mb-3">
            {description || '暂无描述'}
          </p>

          {/* 专长标签 */}
          {expertise && expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expertise.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className={`${getTagStyle(tag)} px-2 py-0.5 rounded-lg text-xs font-medium`}
                >
                  {tag}
                </span>
              ))}
              {expertise.length > 5 && (
                <span className="px-2 py-0.5 rounded-lg text-xs text-white/40">
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
