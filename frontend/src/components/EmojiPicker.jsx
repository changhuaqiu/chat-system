import React from 'react';

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛',
  '😜', '😝', '🤑', '😎', '🤓', '🧐', '🤠', '🥳', '🤡', '🥺',
  '😢', '😭', '😳', '😶', '😱', '😨', '😰', '😥', '😓', '🫣',
  '🤗', '🤔', '🫤', '🤤', '😴', '🥱', '🤮', '🤢', '🤧', '🥴'
];

/**
 * 表情选择器组件 - 像素风格
 */
const EmojiPicker = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-bg-card border-4 border-border p-2 emoji-picker z-10 grid grid-cols-8 gap-1 shadow-pixel-md">
      {emojis.map((emoji, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(emoji)}
          className="emoji-item w-8 h-8 flex items-center justify-center hover:bg-bg-secondary border-2 border-transparent hover:border-pixel-primary cursor-pointer transition-colors"
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiPicker;
