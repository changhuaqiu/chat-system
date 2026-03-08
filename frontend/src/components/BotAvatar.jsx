import React from 'react';

const BotAvatar = ({ botId, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
  ];

  const colorIndex = botId.length % colors.length;
  const displayName = botId.substring(0, 3).toUpperCase();

  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{displayName}</span>
    </div>
  );
};

export default BotAvatar;
