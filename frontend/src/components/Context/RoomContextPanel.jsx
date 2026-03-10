import React, { useState } from 'react';

/**
 * 房间上下文面板 - 像素风格
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
    <div className="bg-bg-card border-4 border-border overflow-hidden">
      {/* 头部 */}
      <div className="bg-bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-home-4-line text-pixel-accent-cyan text-xl" />
          <div>
            <h3 className="text-base font-pixel-title text-white">房间上下文</h3>
            <p className="text-xs text-pixel-gray font-pixel-body">当前项目的背景和目标</p>
          </div>
        </div>
        <button className="px-4 py-2 border-4 border-border text-pixel-gray hover:text-white hover:border-pixel-primary text-sm font-pixel-body transition-colors">
          <i className="ri-edit-line" />
          编辑
        </button>
      </div>

      {/* 内容 */}
      <div className="p-6 space-y-6">
        {/* 项目信息 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-pixel-title text-white">项目目标</label>
            <button
              onClick={() => startEditing('goal', displayContext.goal)}
              className="text-xs text-pixel-accent-purple hover:text-pixel-accent-cyan transition-colors font-pixel-body"
            >
              <i className="ri-edit-line" /> 编辑
            </button>
          </div>
          {editingField === 'goal' ? (
            <div className="flex items-center gap-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-3 py-2 border-4 border-border bg-bg-secondary text-white text-sm font-pixel-body resize-none outline-none focus:border-pixel-primary"
                rows={3}
              />
              <button
                onClick={saveEdit}
                className="px-3 py-2 border-4 border-pixel-primary bg-pixel-primary text-white text-sm font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple"
              >
                保存
              </button>
            </div>
          ) : (
            <p className="text-sm text-white font-pixel-body">{displayContext.goal}</p>
          )}
        </div>

        {/* 里程碑 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-pixel-title text-white">里程碑</label>
            <button className="text-xs text-pixel-accent-purple hover:text-pixel-accent-cyan transition-colors font-pixel-body">
              <i className="ri-add-line" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {displayContext.milestones?.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-2 border-4 border-border bg-bg-secondary"
              >
                <div
                  className={`w-4 h-4 border-4 flex items-center justify-center ${
                    milestone.status === 'done'
                      ? 'border-pixel-accent-green bg-pixel-accent-green'
                      : milestone.status === 'inProgress'
                      ? 'border-pixel-accent-cyan'
                      : 'border-border'
                  }`}
                >
                  {milestone.status === 'done' && <i className="ri-check-line text-xs text-white" />}
                </div>
                <span
                  className={`text-sm font-pixel-body ${
                    milestone.status === 'done'
                      ? 'text-pixel-gray line-through'
                      : 'text-white'
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
            <label className="text-sm font-pixel-title text-white">已做决策</label>
            <button className="text-xs text-pixel-accent-purple hover:text-pixel-accent-cyan transition-colors font-pixel-body">
              <i className="ri-add-line" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {displayContext.decisions?.map((decision) => (
              <div
                key={decision.id}
                className="p-3 border-4 border-pixel-accent-green bg-pixel-accent-green/20"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-white font-pixel-body">{decision.content}</p>
                  <span className="text-xs text-pixel-gray font-pixel-body">{decision.date}</span>
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
