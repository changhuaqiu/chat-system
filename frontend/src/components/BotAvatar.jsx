import React from 'react';

const BotAvatar = ({ botId, size = 'md', status = 'online', roleType = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  // 根据角色类型获取配色 - 像素风格
  const roleColors = {
    developer: 'bg-pixel-primary border-pixel-primary-dark',
    designer: 'bg-pixel-accent-pink border-pink-700',
    manager: 'bg-pixel-accent-orange border-orange-700',
    ai: 'bg-pixel-accent-purple border-purple-700',
    default: 'bg-pixel-accent-cyan border-cyan-700'
  };

  // 根据状态获取动画
  const statusAnimations = {
    online: 'online-indicator',
    thinking: 'pixel-flicker',
    idle: '',
    excited: 'pixel-shake'
  };

  const statusIndicators = {
    online: 'bg-pixel-accent-green',
    thinking: 'bg-pixel-accent-orange',
    idle: 'bg-pixel-gray',
    excited: 'bg-pixel-accent-purple'
  };

  // 使用 botId 生成一致的颜色索引
  const colorIndex = botId ? botId.length % 5 : 0;
  const roleKeys = Object.keys(roleColors);
  const selectedRole = roleType !== 'default' ? roleType : roleKeys[colorIndex];

  const displayName = botId ? botId.substring(0, 3).toUpperCase() : 'BOT';

  return (
    <div className="relative inline-block">
      {/* Avatar 主体 - 像素风格 */}
      <div
        className={`${sizeClasses[size]} ${roleColors[selectedRole]}
          flex items-center justify-center flex-shrink-0 relative z-10 border-4 shadow-pixel-sm
          transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-pixel-md`}
      >
        <span className="text-white font-pixel-title tracking-wider">{displayName}</span>
      </div>

      {/* 状态指示器 */}
      {status && status !== 'idle' && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusIndicators[status]}
            border-2 border-bg-primary ${status === 'online' ? 'online-indicator' : ''}`}
          title={status}
        />
      )}

      {/* 思考中效果 */}
      {status === 'thinking' && (
        <div className="absolute inset-0 border-4 border-pixel-accent-orange animate-pulse" />
      )}
    </div>
  );
};

export default BotAvatar;
