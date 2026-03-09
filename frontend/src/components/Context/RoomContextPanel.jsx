import React, { useState } from 'react';

/**
 * 房间上下文面板
 * 展示项目目标、里程碑、已做出的决策
 */
const RoomContextPanel = ({ context, onUpdate }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const defaultContext = {
    name: '登录功能开发',
    goal: '实现用户邮箱密码登录功能，包含前端界面和后端 API',
    description: '完成用户认证系统的基础功能',
    milestones: [
      { id: 1, title: 'API 设计', status: 'done' },
      { id: 2, title: '前端界面', status: 'inProgress' },
      { id: 3, title: '后端实现', status: 'todo' },
      { id: 4, title: '测试验证', status: 'todo' }
    ],
    decisions: [
      { id: 1, content: '使用 JWT 进行身份验证', date: '2026-03-08' },
      { id: 2, content: '采用 RESTful API 设计风格', date: '2026-03-08' }
    ]
  };

  const displayContext = context || defaultContext;

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const saveEdit = () => {
    onUpdate?.({ [editingField]: editValue });
    setEditingField(null);
    setEditValue('');
  };

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      {/* 头部 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-home-4-line text-blue-400 text-xl" />
          <div>
            <h3 className="text-base font-semibold text-white">房间上下文</h3>
            <p className="text-xs text-white/40">当前项目的背景和目标</p>
          </div>
        </div>
        <button className="px-4 py-2 btn-secondary text-white/70 rounded-xl text-sm font-medium">
          <i className="ri-edit-line" />
          编辑
        </button>
      </div>

      {/* 内容 */}
      <div className="p-6 space-y-6">
        {/* 项目信息 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/70">项目目标</label>
            <button
              onClick={() => startEditing('goal', displayContext.goal)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <i className="ri-edit-line" /> 编辑
            </button>
          </div>
          {editingField === 'goal' ? (
            <div className="flex items-center gap-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-3 py-2 input-field rounded-xl text-white text-sm resize-none"
                rows={3}
              />
              <button
                onClick={saveEdit}
                className="px-3 py-2 btn-primary text-white rounded-xl text-sm"
              >
                保存
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/70">{displayContext.goal}</p>
          )}
        </div>

        {/* 里程碑 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/70">里程碑</label>
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              <i className="ri-add-line" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {displayContext.milestones?.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    milestone.status === 'done'
                      ? 'border-emerald-500 bg-emerald-500'
                      : milestone.status === 'inProgress'
                      ? 'border-blue-500'
                      : 'border-white/30'
                  }`}
                >
                  {milestone.status === 'done' && <i className="ri-check-line text-xs text-white" />}
                </div>
                <span
                  className={`text-sm ${
                    milestone.status === 'done'
                      ? 'text-white/50 line-through'
                      : 'text-white/80'
                  }`}
                >
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 已做决策 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/70">已做决策</label>
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              <i className="ri-add-line" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {displayContext.decisions?.map((decision) => (
              <div
                key={decision.id}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-white/70">{decision.content}</p>
                  <span className="text-xs text-white/40">{decision.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomContextPanel;
