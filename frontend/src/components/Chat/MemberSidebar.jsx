import React from 'react';

const MemberSidebar = ({ members = [], robots = [], onInvite, onAddRobot, onManageWorldInfo }) => {
  const onlineMembers = members.filter(m => m.status === 'online');
  const offlineMembers = members.filter(m => m.status !== 'online');

  const getAvatarColor = (id) => {
      return 'bg-pixel-accent-purple';
  };

  return (
    <div className="w-80 bg-bg-secondary border-l-4 border-border flex flex-col h-full">
      {/* Invite Button */}
      <div className="p-4 border-b-4 border-border">
        <button
          onClick={onInvite}
          className="w-full bg-pixel-accent-green/20 border-4 border-pixel-accent-green text-pixel-accent-green py-3 px-4 font-pixel-title text-xs flex items-center justify-center gap-2"
        >
          <i className="ri-user-add-line text-xl"></i>
          邀请成员
        </button>
      </div>

      {/* World Info Button */}
      <div className="px-4 pb-4 border-b-4 border-border">
        <button
          onClick={onManageWorldInfo}
          className="w-full bg-pixel-accent-purple/20 border-4 border-pixel-accent-purple text-pixel-accent-purple py-3 px-4 font-pixel-title text-xs flex items-center justify-center gap-2"
        >
          <i className="ri-book-mark-line text-xl"></i>
          World Info
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pixel-scrollbar">
        {/* Online Members */}
        <div className="p-4">
          <h3 className="text-sm font-pixel-title text-white mb-3 flex items-center gap-2">
            <i className="ri-flashlight-fill text-pixel-accent-green"></i>
            在线成员 ({onlineMembers.length})
          </h3>
          <div className="space-y-2">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-bg-card cursor-pointer transition-colors border-4 border-transparent hover:border-border">
                <div className="relative">
                  <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} border-4 border-pixel-accent-purple/50 flex items-center justify-center text-white font-pixel-title shadow-pixel-sm`}>
                    {member.avatar || member.name.substring(0, 1)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pixel-accent-green border-2 border-bg-secondary animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-pixel-body text-white">{member.name}</span>
                    <span className="text-xs text-pixel-accent-green font-pixel-title">在线</span>
                  </div>
                </div>
              </div>
            ))}
            {onlineMembers.length === 0 && <p className="text-xs text-pixel-gray pl-2 font-pixel-body">暂无在线成员</p>}
          </div>
        </div>

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
            <div className="px-4 pb-4">
            <h3 className="text-sm font-pixel-title text-pixel-gray mb-3 flex items-center gap-2">
                <i className="ri-time-line"></i>
                离线成员
            </h3>
            <div className="space-y-2">
                {offlineMembers.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-bg-card cursor-pointer transition-colors opacity-60 border-4 border-transparent">
                    <div className="relative">
                    <div className={`w-10 h-10 ${member.color || getAvatarColor(member.id)} border-4 border-border flex items-center justify-center text-white font-pixel-title`}>
                        {member.avatar || member.name.substring(0, 1)}
                    </div>
                    </div>
                    <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-pixel-body text-white">{member.name}</span>
                        <span className="text-xs text-pixel-gray font-pixel-body">离线</span>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Available Robots */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-pixel-title text-white mb-3 flex items-center gap-2">
            <i className="ri-robot-2-line text-pixel-accent-purple"></i>
            可添加的机器人
          </h3>
          <div className="space-y-2">
            {robots.map(robot => (
              <div key={robot.id} className="flex items-center gap-3 p-3 hover:bg-bg-card cursor-pointer transition-colors border-4 border-dashed border-border">
                <div className={`w-10 h-10 ${robot.color || 'bg-pixel-accent-cyan'} border-4 border-pixel-accent-cyan/50 flex items-center justify-center text-white text-lg shadow-pixel-sm`}>
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-pixel-body text-white truncate">{robot.name}</span>
                  </div>
                  <p className="text-xs text-pixel-gray font-pixel-body truncate">{robot.description || 'AI 助手'}</p>
                </div>
                <button
                    onClick={() => onAddRobot(robot)}
                    className="px-3 py-2 bg-pixel-accent-purple/20 border-4 border-pixel-accent-purple text-pixel-accent-purple font-pixel-title text-xs hover:bg-pixel-accent-purple/30 transition-colors"
                >
                  添加
                </button>
              </div>
            ))}
            {robots.length === 0 && <p className="text-xs text-pixel-gray pl-2 font-pixel-body">暂无更多机器人</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSidebar;
