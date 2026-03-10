import React from 'react';

/**
 * 系统消息组件 - 像素风格
 */
const SystemMessage = ({ content }) => {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-bg-card text-pixel-gray text-xs px-4 py-2 border-4 border-border font-pixel-body">
        {content}
      </div>
    </div>
  );
};

export default SystemMessage;
