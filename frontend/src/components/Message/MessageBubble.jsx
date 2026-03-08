import React, { useState } from 'react';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import FileMessage from './FileMessage';
import SystemMessage from './SystemMessage';
import CodeMessage from './CodeMessage';
import { apiService } from '../../services/api';

const MessageBubble = ({ 
  message, 
  isOwn, 
  senderName, 
  avatar, 
  avatarColor, 
  onReply, 
  repliedMessage,
  showAvatar = true
}) => {
  const [showReactions, setShowReactions] = useState(false);

  if (message.messageType === 'system') {
    return <SystemMessage content={message.content} />;
  }

  // Parse metadata safely
  let metadata = {};
  try {
    metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : (message.metadata || {});
  } catch (e) {
    console.error('Failed to parse metadata', e);
  }

  // Group reactions
  const reactionGroups = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || []).concat(r);
    return acc;
  }, {});

  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return <ImageMessage url={message.mediaUrl || message.content} alt="Image" />;
      case 'file':
        return (
          <FileMessage 
            fileName={metadata.file_name || 'unknown_file'}
            fileSize={metadata.file_size || 0}
            fileType={metadata.file_type}
            url={message.mediaUrl || metadata.url}
          />
        );
      case 'code_snippet':
        return (
          <CodeMessage 
            content={message.content} 
            language={metadata.language || 'javascript'} 
          />
        );
      case 'text':
      default:
        return <TextMessage content={message.content} />;
    }
  };

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative mb-4 w-full`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className={`w-8 h-8 ${avatarColor || 'bg-gray-400'} rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-auto mb-1 select-none shadow-sm`}>
          <span className="text-white font-bold text-xs">
            {avatar || (senderName ? senderName.substring(0, 1).toUpperCase() : '?')}
          </span>
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-10" />}

      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {/* Reply Context (Apple Style - Small Bubble Above) */}
        {repliedMessage && (
          <div 
            className={`mb-1 text-xs px-3 py-2 rounded-2xl bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200 w-fit max-w-full flex items-center gap-2
              ${isOwn ? 'mr-2 rounded-br-none' : 'ml-2 rounded-bl-none'}
            `}
            onClick={() => {
                const el = document.getElementById(`msg-${repliedMessage.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el?.classList.add('highlight-message');
                setTimeout(() => el?.classList.remove('highlight-message'), 2000);
            }}
          >
            <div className="w-0.5 h-6 bg-gray-300 rounded-full"></div>
            <div className="flex flex-col truncate">
                <span className="font-semibold text-[10px] text-gray-400">Replying to {repliedMessage.senderName || repliedMessage.sender}</span>
                <span className="truncate max-w-[150px]">{repliedMessage.content}</span>
            </div>
          </div>
        )}

        {/* Sender Name */}
        {!isOwn && showAvatar && (
          <span className="text-[10px] text-gray-400 mb-1 ml-3">{senderName}</span>
        )}

        {/* Message Bubble */}
        <div 
          id={`msg-${message.id}`}
          className={`relative px-4 py-3 shadow-sm transition-all
            ${isOwn 
              ? 'bg-gradient-to-br from-[#007aff] to-[#0062cc] text-white rounded-2xl rounded-br-sm' 
              : 'bg-white text-[#1d1d1f] border border-[#e5e5ea] rounded-2xl rounded-bl-sm'
            }
            ${message.messageType === 'image' ? 'p-1 bg-transparent border-0 shadow-none' : ''}
          `}
        >
          {renderContent()}

          {/* Metadata / Timestamp */}
          <div className={`text-[9px] mt-1 flex items-center justify-end opacity-70 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
             {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </div>
        </div>

        {/* Reactions Display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button 
                key={emoji}
                onClick={() => apiService.toggleReaction(message.id, 'user', emoji)}
                className={`px-2 py-0.5 rounded-full text-xs border flex items-center space-x-1 transition-all shadow-sm
                  ${users.find(u => u.user_id === 'user') 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 scale-105' 
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <span>{emoji}</span>
                <span className="font-medium text-[10px]">{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover Actions */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-14' : '-right-14'} flex items-center space-x-1 transition-opacity duration-200 ${showReactions ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={() => onReply(message)}
          className="p-1.5 rounded-full bg-white text-gray-400 hover:text-[#007aff] hover:bg-blue-50 transition-colors shadow-sm border border-gray-100"
          title="Reply"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
        </button>
        
        {/* Quick Reaction */}
        <div className="relative group/emoji">
          <button className="p-1.5 rounded-full bg-white text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors shadow-sm border border-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <div className="absolute bottom-full mb-2 hidden group-hover/emoji:flex bg-white shadow-xl rounded-full px-2 py-1 border border-gray-100 z-10 left-1/2 transform -translate-x-1/2">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
              <button 
                key={emoji} 
                onClick={() => apiService.toggleReaction(message.id, 'user', emoji)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition text-lg transform hover:scale-125 duration-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
