import React from 'react';

const MemberSidebar = ({ members = [], robots = [], onInvite, onAddRobot, onManageWorldInfo }) => {
  const onlineMembers = members.filter(m => m.status === 'online');
  const offlineMembers = members.filter(m => m.status !== 'online');

  const getAvatarColor = (id) => {
      return 'bg-gradient-to-br from-purple-500 to-pink-500';
  };

  return (
    <div className="w-80 glass-panel border-l border-white/10 flex flex-col h-full transition-all duration-200 bg-[#1a1a2e]/80 backdrop-blur-xl">
      {/* Invite Button */}
      <div className="p-5 border-b border-white/10">
        <button
          onClick={onInvite}
          className="w-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 px-4 rounded-xl font-medium hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <i className="ri-user-add-line text-xl"></i>
          邀请成员
        </button>
      </div>

      {/* World Info Button */}
      <div className="px-5 pb-5 border-b border-white/10">
        <button
          onClick={onManageWorldInfo}
          className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-400 py-2.5 px-4 rounded-xl font-medium hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <i className="ri-book-mark-line text-xl"></i>
          World Info
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Online Members */}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <i className="ri-flashlight-fill text-emerald-400"></i>
            在线成员 ({onlineMembers.length})
          </h3>
          <div className="space-y-2">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors">
                <div className="relative">
                  <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} rounded-xl flex items-center justify-center text-white font-medium shadow-lg`}>
                    {member.avatar || member.name.substring(0, 1)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1a2e] animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{member.name}</span>
                    <span className="text-xs text-emerald-400 font-medium">在线</span>
                  </div>
                </div>
              </div>
            ))}
            {onlineMembers.length === 0 && <p className="text-xs text-white/30 pl-2">暂无在线成员</p>}
          </div>
        </div>

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
            <div className="px-5 pb-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <i className="ri-time-line text-white/40"></i>
                离线成员
            </h3>
            <div className="space-y-2">
                {offlineMembers.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors opacity-60">
                    <div className="relative">
                    <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} rounded-xl flex items-center justify-center text-white font-medium shadow-lg`}>
                        {member.avatar || member.name.substring(0, 1)}
                    </div>
                    </div>
                    <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{member.name}</span>
                        <span className="text-xs text-white/40">离线</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Available Robots */}
        <div className="px-5 pb-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <i className="ri-robot-2-line text-purple-400"></i>
            可添加的机器人
          </h3>
          <div className="space-y-2">
            {robots.map(robot => (
              <div key={robot.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-dashed border-white/10">
                <div className={`w-10 h-10 ${robot.color || 'bg-gradient-to-br from-cyan-500 to-blue-500'} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate">{robot.name}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{robot.description || 'AI 助手'}</p>
                </div>
                <button
                    onClick={() => onAddRobot(robot)}
                    className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
                >
                  添加
                </button>
              </div>
            ))}
            {robots.length === 0 && <p className="text-xs text-white/30 pl-2">暂无更多机器人</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSidebar;
