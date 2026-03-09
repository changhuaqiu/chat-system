import React from 'react';

const BotAvatar = ({ botId, size = 'md', status = 'online', roleType = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  // 根据角色类型获取配色
  const roleColors = {
    developer: 'from-indigo-500 to-purple-500 shadow-glow-sm',
    designer: 'from-pink-500 to-rose-500 shadow-glow-sm',
    manager: 'from-amber-500 to-orange-500 shadow-glow-sm',
    ai: 'from-purple-500 via-violet-500 to-fuchsia-500 shadow-glow-md',
    default: 'from-cyan-500 to-blue-500 shadow-glow-sm'
  };

  // 根据状态获取动画
  const statusAnimations = {
    online: 'online-indicator',
    thinking: 'glow-pulse',
    idle: '',
    excited: 'glow-pulse'
  };

  const statusIndicators = {
    online: 'bg-emerald-500',
    thinking: 'bg-amber-500',
    idle: 'bg-gray-500',
    excited: 'bg-purple-500'
  };

  // 使用 botId 生成一致的颜色索引
  const colorIndex = botId ? botId.length % 5 : 0;
  const roleKeys = Object.keys(roleColors);
  const selectedRole = roleType !== 'default' ? roleType : roleKeys[colorIndex];

  const displayName = botId ? botId.substring(0, 3).toUpperCase() : 'BOT';

  return (
    <div className="relative inline-block">
      {/* 动态光晕效果 */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${roleColors[selectedRole]} blur-md opacity-60 ${statusAnimations[status]}`}
      />

      {/* Avatar 主体 */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${roleColors[selectedRole]}
          flex items-center justify-center flex-shrink-0 relative z-10 shadow-lg
          transition-transform duration-300 hover:scale-110`}
      >
        <span className="text-white font-bold tracking-wider">{displayName}</span>
      </div>

      {/* 状态指示器 */}
      {status && status !== 'idle' && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusIndicators[status]}
            rounded-full border-2 border-gray-900 ${status === 'online' ? 'online-indicator' : ''}`}
          title={status}
        />
      )}

      {/* 思考中光环 */}
      {status === 'thinking' && (
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/50 pulse-ring" />
      )}
    </div>
  );
};

export default BotAvatar;
