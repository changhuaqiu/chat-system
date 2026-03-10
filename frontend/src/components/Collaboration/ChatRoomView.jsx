import React from 'react';
import ContextHierarchy from '../Context/ContextHierarchy';

/**
 * 聊天室模式视图 - 像素风格
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
      <div className="bg-bg-card border-b-4 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-pixel-title text-white flex items-center gap-2">
              <i className="ri-chat-3-line text-pixel-accent-cyan" />
              {roomInfo?.name || '聊天室'}
            </h2>
            <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
              {roomInfo?.description || '自由讨论空间'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-pixel-gray font-pixel-body">热门话题</span>
          </div>
        </div>

        {/* 话题标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className="px-4 py-2 border-4 border-pixel-accent-cyan bg-pixel-accent-cyan/20 text-pixel-accent-cyan text-sm font-pixel-body
                hover:bg-pixel-accent-cyan/30 transition-colors flex items-center gap-2"
            >
              <span>#{topic.name}</span>
              <span className="text-xs text-pixel-accent-cyan/60">{topic.count}</span>
            </button>
          ))}
          <button className="px-4 py-2 border-4 border-border bg-bg-secondary text-pixel-gray text-sm font-pixel-body
            hover:bg-pixel-border-light transition-colors flex items-center gap-1">
            <i className="ri-add-line" />
            添加话题
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* 右侧上下文层级面板 */}
        <div className="w-80 flex-shrink-0">
          <ContextHierarchy currentLevel="room" />
        </div>
      </div>
    </div>
  );
};

export default ChatRoomView;
