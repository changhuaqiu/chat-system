import React from 'react';

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛',
  ' Mig', ' laugh', '😝', '🤑', '😎', '🤓', '🧐', '🤠', '🥳', '🤡',
  'Tech', '🥺', '😢', '😭', '睇', '😳', '😶‍🌫️', ' shock', '😨', '😰',
  '😥', '😓', '🫣', '🤗', '🤔', '🫤', ' sinister', '🤤', '😴', '🥱',
  '🤮', '🤢', '🤧', '恶', 'fu', '😎', '🤠', '🤡', '🤠', '🤡'
];

const EmojiPicker = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg p-2 emoji-picker z-10 grid grid-cols-8 gap-1">
      {emojis.map((emoji, idx) => (
        <div 
          key={idx} 
          onClick={() => onSelect(emoji)}
          className="emoji-item"
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiPicker;
