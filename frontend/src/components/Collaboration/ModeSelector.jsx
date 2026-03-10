import React, { useState } from 'react';

const ModeSelector = ({ selectedMode, onModeSelect }) => {
  const [hoveredMode, setHoveredMode] = useState(null);

  const modes = [
    {
      id: 'war-room',
      name: '作战室模式',
      icon: 'ri-sword-line',
      description: '有明确目标的任务执行模式。Leader 负责分解任务、委派工作、汇总结果。',
      tags: ['任务分解', 'Leader 制', '结果汇总'],
      scenarios: '项目开发、功能实现、功能修复',
      borderColor: 'border-pixel-accent-pink',
      iconBg: 'bg-pixel-accent-pink',
      badgeColor: 'mode-badge-war'
    },
    {
      id: 'chat-room',
      name: '聊天室模式',
      icon: 'ri-chat-3-line',
      description: '日常交流、自由讨论的模式。无明确目标，扁平化互动，所有成员自由发言。',
      tags: ['自由讨论', '扁平化', '社交化'],
      scenarios: '头脑风暴、日常交流、团队闲聊',
      borderColor: 'border-pixel-accent-cyan',
      iconBg: 'bg-pixel-accent-cyan',
      badgeColor: 'mode-badge-chat'
    },
    {
      id: 'panel',
      name: '专家会诊模式',
      icon: 'ri-group-2-line',
      description: '多专家独立发表意见的模式。无 Leader，每个专家提供专业建议，可投票决策。',
      tags: ['多专家', '独立意见', '投票决策'],
      scenarios: '架构评审、技术选型、方案评估',
      borderColor: 'border-pixel-accent-purple',
      iconBg: 'bg-pixel-accent-purple',
      badgeColor: 'mode-badge-panel'
    },
    {
      id: 'standalone',
      name: '独立模式',
      icon: 'ri-user-3-line',
      description: '单一专家咨询模式。只有一个 Bot 工作，无协作需求，专注于一对一对话。',
      tags: ['一对一', '专注', '高效'],
      scenarios: '代码咨询、问题排查、专业问答',
      borderColor: 'border-pixel-accent-green',
      iconBg: 'bg-pixel-accent-green',
      badgeColor: 'mode-badge-standalone'
    }
  ];

  const handleSelect = (modeId) => {
    onModeSelect(modeId);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-xl font-pixel-title text-white mb-2">选择协作模式</h2>
        <p className="text-pixel-gray text-sm font-pixel-body">选择适合你需求的协作方式</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, index) => (
          <div
            key={mode.id}
            className={`bg-bg-card border-4 cursor-pointer transition-all fade-in
              ${selectedMode === mode.id ? mode.borderColor + ' shadow-pixel-md' : 'border-border hover:border-pixel-border-light'}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleSelect(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className={`w-14 h-14 ${mode.iconBg} border-4 border-white/20 flex items-center justify-center shadow-pixel-sm`}>
                  <i className={`${mode.icon} text-white text-3xl`} />
                </div>
              </div>
              {/* 选中指示器 */}
              <div
                className={`w-8 h-8 border-4 flex items-center justify-center transition-colors
                  ${selectedMode === mode.id
                    ? mode.iconBg + ' border-white/20'
                    : 'border-border bg-bg-secondary'
                  }`}
              >
                {selectedMode === mode.id && (
                  <i className="ri-check-line text-white text-lg check-icon" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-pixel-title text-white mb-2">{mode.name}</h3>
            <p className="text-pixel-gray text-sm mb-4 font-pixel-body">{mode.description}</p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mode.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-xs font-pixel-body ${mode.badgeColor}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 适用场景 */}
            <div className="pt-4 border-t-4 border-border">
              <p className="text-xs text-pixel-gray mb-2 font-pixel-body">适用场景</p>
              <div className="flex items-center gap-2 text-sm text-pixel-gray font-pixel-body">
                <i className="ri-lightbulb-line" />
                <span>{mode.scenarios}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
