import React from 'react';

const ChatSidebar = ({ rooms, currentRoomId, onSelectRoom, onCreateRoom }) => {
  return (
    <div className="w-80 bg-white border-r border-[#e5e5ea] flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#e5e5ea] bg-[#fafafa]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
            聊天室
          </h1>
          <button className="p-2 hover:bg-[#f0f0f5] rounded-lg transition-colors" title="设置">
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
        <button 
          onClick={onCreateRoom}
          className="w-full bg-[#007aff] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#0066cc] transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          创建新聊天室
        </button>
      </div>
      
      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-medium text-[#8e8e93] uppercase tracking-wider px-3 py-2">我的聊天室</div>
        
        {rooms.map(room => (
          <div 
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
              ${currentRoomId === room.id 
                ? 'bg-[rgba(0,122,255,0.12)]' 
                : 'hover:bg-[rgba(0,122,255,0.08)]'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${room.color || 'bg-[#00c7be]'} rounded-xl flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 shadow-sm`}>
                {room.icon || '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#1d1d1f] truncate">{room.name}</h3>
                  {room.unreadCount > 0 && (
                    <span className="text-xs bg-[#007aff] text-white px-2 py-0.5 rounded-full">{room.unreadCount}</span>
                  )}
                </div>
                <p className="text-sm text-[#8e8e93] truncate mt-1">
                  {room.lastMessage || room.description || '暂无消息'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                   {/* Mock avatars for now */}
                   <div className="flex -space-x-2">
                      <div className="w-5 h-5 bg-[#007aff] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">A</div>
                   </div>
                   <span className="text-xs text-[#8e8e93]">{room.lastActive || '刚刚'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {rooms.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">
                暂无聊天室
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
