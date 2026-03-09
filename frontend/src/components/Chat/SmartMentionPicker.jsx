import React, { useState, useMemo, useEffect } from 'react';

/**
 * 智能 @提及选择器
 * 显示机器人能力标签，根据上下文关键词推荐排序
 */
const SmartMentionPicker = ({
  agents,
  query,
  onSelect,
  onClose,
  contextKeywords = [] // 当前对话上下文关键词
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 根据能力和上下文匹配度排序
  const sortedAgents = useMemo(() => {
    if (!agents || agents.length === 0) return [];

    return agents
      .map((agent) => {
        let score = 0;

        // 名称匹配
        if (agent.name.toLowerCase().includes(query.toLowerCase())) {
          score += 100;
        }

        // 能力匹配上下文关键词
        const expertise = agent.expertise || [];
        const collaborationSkills = agent.collaborationSkills || [];
        const allTags = [...expertise, ...collaborationSkills];

        contextKeywords.forEach((keyword) => {
          if (allTags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 50;
          }
        });

        // 根据查询匹配能力标签
        allTags.forEach((tag) => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            score += 30;
          }
        });

        return { ...agent, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [agents, query, contextKeywords]);

  const filteredAgents = useMemo(() => {
    if (!query) return sortedAgents;
    return sortedAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.expertise?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
        agent.collaborationSkills?.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
  }, [sortedAgents, query]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredAgents.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredAgents.length) % filteredAgents.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredAgents[selectedIndex]) {
          onSelect(filteredAgents[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredAgents, selectedIndex, onSelect, onClose]);

  // 获取能力标签样式
  const getTagStyle = (tag) => {
    const tagStyles = {
      coding: 'tag-expertise',
      api_design: 'tag-expertise',
      database: 'tag-expertise',
      design: 'tag-role',
      ui: 'tag-role',
      management: 'tag-role',
      task_execution: 'tag-skill',
      code_review: 'tag-skill',
      technical_advice: 'tag-skill'
    };
    return tagStyles[tag] || 'tag-expertise';
  };

  if (filteredAgents.length === 0) {
    return (
      <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
        <div className="px-4 py-3 text-center text-white/40 text-sm">
          未找到匹配的成员
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden z-50 fade-in-scale">
      {/* 头部 */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-medium text-white/60">提及成员</span>
        <span className="text-xs text-white/30">{filteredAgents.length} 位成员</span>
      </div>

      {/* 列表 */}
      <div className="max-h-64 overflow-y-auto scrollbar-thin p-2">
        {filteredAgents.map((agent, idx) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
              idx === selectedIndex
                ? 'bg-purple-500/20 border border-purple-500/30'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-xs font-bold">
                  {agent.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{agent.name}</span>
                  {agent.canWorkAs?.includes('expert') && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                      专家
                    </span>
                  )}
                </div>

                {/* 能力标签 */}
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {(agent.expertise?.slice(0, 3) || []).map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className={`${getTagStyle(tag)} px-1.5 py-0.5 rounded text-[10px] font-medium`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 推荐标识 */}
              {agent.score >= 50 && idx !== selectedIndex && (
                <i className="ri-star-fill text-yellow-400 text-xs" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
        <span>↑↓ 导航</span>
        <span>Enter 选择</span>
        <span>Esc 关闭</span>
      </div>
    </div>
  );
};

export default SmartMentionPicker;
