import React from 'react';

/**
 * 全局记忆面板 - 像素风格
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
    <div className="bg-bg-card border-4 border-border overflow-hidden">
      {/* 头部 */}
      <div className="bg-bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-global-line text-pixel-accent-pink text-xl" />
          <div>
            <h3 className="text-base font-pixel-title text-white">全局记忆</h3>
            <p className="text-xs text-pixel-gray font-pixel-body">跨房间的持久化信息</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 border-4 border-border text-pixel-gray hover:text-white hover:border-pixel-primary transition-colors"
        >
          <i className="ri-add-line text-xl" />
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b-4 border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="输入新的全局记忆..."
              className="flex-1 px-4 py-2 border-4 border-border bg-bg-secondary text-white font-pixel-body placeholder-pixel-gray focus:border-pixel-primary outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple transition-colors"
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
            className="p-3 border-4 border-border bg-bg-secondary hover:border-pixel-border-light transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 border-2 text-xs font-pixel-body ${
                      memory.type === 'preference'
                        ? 'border-pixel-accent-pink bg-pixel-accent-pink/20 text-pixel-accent-pink'
                        : 'border-pixel-accent-cyan bg-pixel-accent-cyan/20 text-pixel-accent-cyan'
                    }`}
                  >
                    {memory.type === 'preference' ? '偏好' : '项目'}
                  </span>
                  <span className="text-xs text-pixel-gray font-pixel-body">{memory.createdAt}</span>
                </div>
                <p className="text-sm text-white font-pixel-body">{memory.content}</p>
              </div>
              <button
                onClick={() => onDeleteMemory?.(memory.id)}
                className="p-1 text-pixel-gray hover:text-pixel-accent-pink transition-colors"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          </div>
        ))}

        {displayMemories.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-inbox-line text-4xl text-pixel-gray mb-2" />
            <p className="text-pixel-gray text-sm font-pixel-body">暂无全局记忆</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMemoryPanel;
