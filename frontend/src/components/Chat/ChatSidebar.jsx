import React, { memo } from 'react';

const ChatSidebar = ({ rooms, currentRoomId, onSelectRoom, onCreateRoom }) => {
  return (
    <div className="w-80 glass-panel border-r border-white/10 flex flex-col h-full transition-all duration-200 bg-[#1a1a2e]/80 backdrop-blur-xl">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            聊天室
          </h1>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="设置">
            <i className="ri-settings-4-line text-lg text-white/60"></i>
          </button>
        </div>
        <button
          onClick={onCreateRoom}
          className="w-full btn-primary text-white py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <i className="ri-add-line text-xl"></i>
          创建新聊天室
        </button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-2">我的聊天室</div>

        {rooms.map(room => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
              ${currentRoomId === room.id
                ? 'bg-purple-500/20 border-purple-500/30'
                : 'hover:bg-white/10'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${room.color || 'bg-gradient-to-br from-cyan-500 to-blue-500'} rounded-xl flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 shadow-lg`}>
                {room.icon || '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white truncate">{room.name}</h3>
                  {room.unreadCount > 0 && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">{room.unreadCount}</span>
                  )}
                </div>
                <p className="text-sm text-white/40 truncate mt-1">
                  {room.lastMessage || room.description || '暂无消息'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex -space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-[#1a1a2e] flex items-center justify-center text-[10px] text-white">A</div>
                   </div>
                   <span className="text-xs text-white/40">{room.lastActive || '刚刚'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
            <div className="text-center text-white/30 py-10 text-sm">
                暂无聊天室
            </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatSidebar);
