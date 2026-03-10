import React, { memo } from 'react';

const ChatSidebar = ({ rooms, currentRoomId, onSelectRoom, onCreateRoom }) => {
  return (
    <div className="w-80 bg-bg-secondary border-r-4 border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-4 border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-pixel-title text-white tracking-tight">
            聊天室
          </h1>
          <button className="p-2 hover:bg-bg-card border-4 border-transparent hover:border-border transition-colors" title="设置">
            <i className="ri-settings-4-line text-lg text-pixel-gray"></i>
          </button>
        </div>
        <button
          onClick={onCreateRoom}
          className="w-full btn-primary text-white py-3 px-4 font-pixel-title text-xs flex items-center justify-center gap-2"
        >
          <i className="ri-add-line text-xl"></i>
          创建新聊天室
        </button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 pixel-scrollbar">
        <div className="text-xs font-pixel-title text-pixel-gray uppercase tracking-wider px-3 py-2">我的聊天室</div>

        {rooms.map(room => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`p-3 cursor-pointer transition-colors border-l-4
              ${currentRoomId === room.id
                ? 'bg-pixel-primary/20 border-l-pixel-primary'
                : 'border-l-transparent hover:bg-bg-card hover:border-l-border'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${room.color || 'bg-pixel-accent-cyan'} border-4 border-pixel-accent-cyan/50 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-pixel-sm`}>
                {room.icon || '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel-body text-base text-white truncate">{room.name}</h3>
                  {room.unreadCount > 0 && (
                    <span className="text-xs bg-pixel-accent-pink text-white px-2 py-0.5 font-pixel-title">{room.unreadCount}</span>
                  )}
                </div>
                <p className="text-sm text-pixel-gray font-pixel-body truncate mt-1">
                  {room.lastMessage || room.description || '暂无消息'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-pixel-accent-purple border-2 border-bg-secondary flex items-center justify-center text-[10px] text-white font-pixel-title">A</div>
                   </div>
                   <span className="text-xs text-pixel-gray font-pixel-body">{room.lastActive || '刚刚'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
            <div className="text-center text-pixel-gray py-10 text-sm font-pixel-body">
                暂无聊天室
            </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatSidebar);
