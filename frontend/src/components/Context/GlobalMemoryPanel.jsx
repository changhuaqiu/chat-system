import React from 'react';

/**
 * 全局记忆面板
 * 展示用户偏好、历史项目摘要等全局信息
 */
const GlobalMemoryPanel = ({ memories = [], onAddMemory, onDeleteMemory }) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newMemory, setNewMemory] = React.useState('');

  const defaultMemories = [
    { id: 1, type: 'preference', content: '偏好使用 TypeScript 进行开发', createdAt: '2026-03-01' },
    { id: 2, type: 'project', content: '正在进行多机器人协作系统开发', createdAt: '2026-03-05' },
    { id: 3, type: 'preference', content: '喜欢简洁的代码风格，注重可读性', createdAt: '2026-03-07' },
    { id: 4, type: 'project', content: '使用 React + TailwindCSS 构建前端', createdAt: '2026-03-08' }
  ];

  const displayMemories = memories.length > 0 ? memories : defaultMemories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMemory.trim()) {
      onAddMemory?.({
        id: Date.now(),
        type: 'preference',
        content: newMemory.trim(),
        createdAt: new Date().toISOString().split('T')[0]
      });
      setNewMemory('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      {/* 头部 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-global-line text-pink-400 text-xl" />
          <div>
            <h3 className="text-base font-semibold text-white">全局记忆</h3>
            <p className="text-xs text-white/40">跨房间的持久化信息</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 rounded-xl btn-secondary text-white/60 hover:text-white transition-all"
        >
          <i className="ri-add-line text-xl" />
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="输入新的全局记忆..."
              className="flex-1 px-4 py-2 input-field rounded-xl text-white placeholder-white/30 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 btn-primary text-white rounded-xl font-medium"
            >
              添加
            </button>
          </div>
        </form>
      )}

      {/* 记忆列表 */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
        {displayMemories.map((memory) => (
          <div
            key={memory.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      memory.type === 'preference'
                        ? 'bg-pink-500/20 text-pink-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {memory.type === 'preference' ? '偏好' : '项目'}
                  </span>
                  <span className="text-xs text-white/40">{memory.createdAt}</span>
                </div>
                <p className="text-sm text-white/70">{memory.content}</p>
              </div>
              <button
                onClick={() => onDeleteMemory?.(memory.id)}
                className="p-1 text-white/30 hover:text-white/60 transition-all"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          </div>
        ))}

        {displayMemories.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-inbox-line text-4xl text-white/20 mb-2" />
            <p className="text-white/40 text-sm">暂无全局记忆</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMemoryPanel;
