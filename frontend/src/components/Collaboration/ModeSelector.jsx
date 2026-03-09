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
      gradient: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      hoverBorderColor: 'hover:border-red-500/60',
      selectedColor: 'selected:border-red-500/60 selected:shadow-[0_20px_60px_rgba(239,68,68,0.3)]',
      badgeColor: 'mode-badge-war',
      iconBg: 'bg-gradient-to-br from-red-500 to-orange-500'
    },
    {
      id: 'chat-room',
      name: '聊天室模式',
      icon: 'ri-chat-3-line',
      description: '日常交流、自由讨论的模式。无明确目标，扁平化互动，所有成员自由发言。',
      tags: ['自由讨论', '扁平化', '社交化'],
      scenarios: '头脑风暴、日常交流、团队闲聊',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBorderColor: 'hover:border-blue-500/60',
      selectedColor: 'selected:border-blue-500/60 selected:shadow-[0_20px_60px_rgba(59,130,246,0.3)]',
      badgeColor: 'mode-badge-chat',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 'panel',
      name: '专家会诊模式',
      icon: 'ri-group-2-line',
      description: '多专家独立发表意见的模式。无 Leader，每个专家提供专业建议，可投票决策。',
      tags: ['多专家', '独立意见', '投票决策'],
      scenarios: '架构评审、技术选型、方案评估',
      gradient: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      hoverBorderColor: 'hover:border-purple-500/60',
      selectedColor: 'selected:border-purple-500/60 selected:shadow-[0_20px_60px_rgba(139,92,246,0.3)]',
      badgeColor: 'mode-badge-panel',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500'
    },
    {
      id: 'standalone',
      name: '独立模式',
      icon: 'ri-user-3-line',
      description: '单一专家咨询模式。只有一个 Bot 工作，无协作需求，专注于一对一对话。',
      tags: ['一对一', '专注', '高效'],
      scenarios: '代码咨询、问题排查、专业问答',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      hoverBorderColor: 'hover:border-emerald-500/60',
      selectedColor: 'selected:border-emerald-500/60 selected:shadow-[0_20px_60px_rgba(16,185,129,0.3)]',
      badgeColor: 'mode-badge-standalone',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500'
    }
  ];

  const handleSelect = (modeId) => {
    onModeSelect(modeId);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">选择协作模式</h2>
        <p className="text-white/40 text-sm">选择适合你需求的协作方式</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, index) => (
          <div
            key={mode.id}
            className={`mode-card ${mode.bgColor} ${mode.borderColor} ${mode.hoverBorderColor}
              ${selectedMode === mode.id ? 'selected' : ''}
              ${mode.selectedColor}
              p-6 rounded-2xl cursor-pointer border backdrop-blur-sm
              fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleSelect(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                {/* 脉冲光环 */}
                {(hoveredMode === mode.id || selectedMode === mode.id) && (
                  <div className={`absolute inset-0 rounded-2xl ${mode.iconBg} opacity-30 pulse-ring`} />
                )}
                {/* 图标 */}
                <div className={`w-14 h-14 rounded-2xl ${mode.iconBg} flex items-center justify-center relative shadow-lg`}>
                  <i className={`${mode.icon} text-white text-3xl`} />
                </div>
              </div>
              {/* 选中指示器 */}
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                  ${selectedMode === mode.id
                    ? `${mode.iconBg.replace('from-', 'bg-').replace(' to-', '')} border-transparent`
                    : 'border-white/20'
                  }`}
              >
                {selectedMode === mode.id && (
                  <i className="ri-check-line text-white text-lg check-icon" />
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{mode.name}</h3>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">{mode.description}</p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mode.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${mode.badgeColor}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 适用场景 */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 mb-2">适用场景</p>
              <div className="flex items-center gap-2 text-sm text-white/50">
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
