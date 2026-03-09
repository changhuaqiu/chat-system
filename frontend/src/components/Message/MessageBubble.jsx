import React, { useState } from 'react';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import FileMessage from './FileMessage';
import SystemMessage from './SystemMessage';
import CodeMessage from './CodeMessage';
import { apiService } from '../../services/api';
import BotAvatar from '../BotAvatar';

const MessageBubble = ({
  message,
  isOwn,
  senderName,
  avatar,
  avatarColor,
  onReply,
  repliedMessage,
  showAvatar = true,
  senderType = 'user' // 'user', 'bot', 'ai'
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

  // Determine bubble style based on sender and ownership
  const getBubbleStyle = () => {
    if (isOwn) {
      return 'message-bubble-user';
    }
    if (senderType === 'ai' || senderType === 'bot') {
      return 'message-bubble-ai';
    }
    return 'message-bubble-other';
  };

  const getTextStyle = () => {
    if (isOwn) {
      return 'text-white';
    }
    if (senderType === 'ai' || senderType === 'bot') {
      return 'text-white/90';
    }
    return 'text-white/90';
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative mb-4 w-full message-enter`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className="mr-3 mt-auto mb-1">
          <BotAvatar
            botId={senderName || 'bot'}
            size="md"
            status={senderType === 'ai' ? 'online' : 'idle'}
            roleType={senderType}
          />
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-10" />}

      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Sender Info */}
        {!isOwn && showAvatar && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-sm font-medium text-white/90">{senderName}</span>
            {senderType === 'ai' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                AI
              </span>
            )}
            <span className="text-xs text-white/30">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
            </span>
          </div>
        )}

        {/* Reply Context */}
        {repliedMessage && (
          <div
            className={`mb-2 text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all border border-white/10 w-fit max-w-full flex items-center gap-2
              ${isOwn ? 'mr-1 rounded-br-none bg-white/5' : 'ml-1 rounded-bl-none bg-white/5'}
            `}
            onClick={() => {
                const el = document.getElementById(`msg-${repliedMessage.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el?.classList.add('message-highlight');
                setTimeout(() => el?.classList.remove('message-highlight'), 2000);
            }}
          >
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent rounded-full"></div>
            <div className="flex flex-col truncate">
                <span className="font-medium text-xs text-white/50">Replying to {repliedMessage.senderName || repliedMessage.sender}</span>
                <span className="truncate max-w-[200px] text-white/70">{repliedMessage.content}</span>
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          id={`msg-${message.id}`}
          className={`relative px-5 py-4 shadow-lg transition-all rounded-2xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}
            ${getBubbleStyle()}
            ${message.messageType === 'image' ? 'p-1 bg-transparent border-0 shadow-none' : ''}
          `}
        >
          <div className={getTextStyle()}>
            {renderContent()}
          </div>

          {/* Quick Actions */}
          {senderType === 'ai' && !isOwn && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
              <button className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                <i className="ri-thumb-up-line"></i> 收到
              </button>
              <button className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                <i className="ri-chat-1-line"></i> 追问
              </button>
              <button className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                <i className="ri-share-forward-line"></i> 分享
              </button>
            </div>
          )}
        </div>

        {/* Reactions Display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => apiService.toggleReaction(message.id, 'user', emoji)}
                className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1.5 transition-all shadow-sm
                  ${users.find(u => u.user_id === 'user')
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 scale-105'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
              >
                <span>{emoji}</span>
                <span className="font-medium">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp for own messages */}
        {isOwn && (
          <span className="text-xs text-white/30 mt-1 mr-1 text-right">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </span>
        )}
      </div>

      {/* Hover Actions */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-14' : '-right-14'} flex items-center space-x-1 transition-opacity duration-200 ${showReactions ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={() => onReply(message)}
          className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
          title="Reply"
        >
          <i className="ri-reply-line text-lg"></i>
        </button>

        {/* Quick Reaction */}
        <div className="relative group/emoji">
          <button className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-yellow-400 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
            <i className="ri-emotion-line text-lg"></i>
          </button>
          <div className="absolute bottom-full mb-2 hidden group-hover/emoji:flex bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-xl px-3 py-2 border border-white/10 z-10 left-1/2 transform -translate-x-1/2">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
              <button
                key={emoji}
                onClick={() => apiService.toggleReaction(message.id, 'user', emoji)}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-xl transform hover:scale-125 duration-200"
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
