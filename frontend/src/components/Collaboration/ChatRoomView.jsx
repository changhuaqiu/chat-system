import React from 'react';

/**
 * 聊天室模式视图
 * 特点：轻松氛围、话题标签、自由互动
 */
const ChatRoomView = ({ children, roomInfo, members }) => {
  const topics = [
    { id: 1, name: '日常交流', count: 24 },
    { id: 2, name: '技术分享', count: 12 },
    { id: 3, name: '股票讨论', count: 8 },
    { id: 4, name: 'AI 趋势', count: 5 }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顶部信息栏 - 显示话题标签 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <i className="ri-chat-3-line text-blue-400" />
              {roomInfo?.name || '聊天室'}
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {roomInfo?.description || '自由讨论空间'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">热门话题</span>
          </div>
        </div>

        {/* 话题标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium
                hover:bg-blue-500/20 transition-all flex items-center gap-2"
            >
                <span>#{topic.name}</span>
                <span className="text-xs text-blue-400/60">{topic.count}</span>
              </button>
          ))}
          <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm
            hover:bg-white/10 transition-all flex items-center gap-1">
            <i className="ri-add-line" />
            添加话题
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ChatRoomView;
