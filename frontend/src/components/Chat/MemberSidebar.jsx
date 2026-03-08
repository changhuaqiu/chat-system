import React from 'react';

const MemberSidebar = ({ members = [], robots = [], onInvite, onAddRobot }) => {
  const onlineMembers = members.filter(m => m.status === 'online');
  const offlineMembers = members.filter(m => m.status !== 'online');

  const getAvatarColor = (id) => {
      // Simple hash for color if not provided
      return 'bg-blue-500';
  };

  return (
    <div className="w-80 bg-white border-l border-[#e5e5ea] flex flex-col h-full transition-all duration-200">
      {/* Invite Button */}
      <div className="p-5 border-b border-[#e5e5ea] bg-[#fafafa]">
        <button
          onClick={onInvite}
          className="w-full bg-[#34c759] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#28a745] transition-all flex items-center justify-center gap-2 shadow-sm hover:translate-y-[-1px] hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          邀请成员
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Online Members */}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            在线成员 ({onlineMembers.length})
          </h3>
          <div className="space-y-2">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] cursor-pointer transition-colors">
                <div className="relative">
                  <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} rounded-xl flex items-center justify-center text-white font-medium shadow-sm`}>
                    {member.avatar || member.name.substring(0, 1)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#34c759] rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1d1d1f]">{member.name}</span>
                    <span className="text-xs text-[#34c759] font-medium">在线</span>
                  </div>
                </div>
              </div>
            ))}
            {onlineMembers.length === 0 && <p className="text-xs text-gray-400 pl-2">暂无在线成员</p>}
          </div>
        </div>

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
            <div className="px-5 pb-5">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                离线成员
            </h3>
            <div className="space-y-2">
                {offlineMembers.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] cursor-pointer transition-colors opacity-60">
                    <div className="relative">
                    <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} rounded-xl flex items-center justify-center text-white font-medium shadow-sm`}>
                        {member.avatar || member.name.substring(0, 1)}
                    </div>
                    </div>
                    <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1d1d1f]">{member.name}</span>
                        <span className="text-xs text-[#8e8e93]">离线</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Available Robots */}
        <div className="px-5 pb-5">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#af52de]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            可添加的机器人
          </h3>
          <div className="space-y-2">
            {robots.map(robot => (
              <div key={robot.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] cursor-pointer transition-colors border border-dashed border-[#e5e5ea]">
                <div className={`w-10 h-10 ${robot.color || 'bg-[#5ac8fa]'} rounded-xl flex items-center justify-center text-white text-lg shadow-sm`}>
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1d1d1f] truncate">{robot.name}</span>
                  </div>
                  <p className="text-xs text-[#8e8e93] truncate">{robot.description || 'AI 助手'}</p>
                </div>
                <button
                    onClick={() => onAddRobot(robot)}
                    className="px-3 py-1.5 bg-[#f0f0f5] text-[#007aff] rounded-lg text-sm font-medium hover:bg-[#e5e5ea] transition-colors"
                >
                  添加
                </button>
              </div>
            ))}
            {robots.length === 0 && <p className="text-xs text-gray-400 pl-2">暂无更多机器人</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSidebar;
