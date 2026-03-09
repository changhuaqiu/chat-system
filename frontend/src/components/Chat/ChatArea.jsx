import React, { useRef, useEffect, useState, useMemo } from 'react';
import MessageBubble from '../Message/MessageBubble';
import SmartMentionPicker from './SmartMentionPicker';

const ChatArea = ({
  roomInfo,
  messages,
  currentUser,
  input,
  setInput,
  onSendMessage,
  onTyping,
  typingUsers,
  typingAgents,
  agentList,
  showEmojiPicker,
  setShowEmojiPicker,
  showImagePicker,
  setShowImagePicker,
  fileInputRef,
  handleImageUpload,
  emojiList,
  handleEmojiSelect,
  uploadedImages,
  handleImageSelect,
  replyingTo,
  setReplyingTo,
  inputRef,
  collaborationMode = 'chat-room'
}) => {
  const messagesEndRef = useRef(null);

  // Mention Logic
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

  // 获取协作模式徽章样式
  const getModeBadge = (mode) => {
    const badges = {
      'war-room': { className: 'mode-badge-war', icon: 'ri-sword-line', label: '作战室模式' },
      'chat-room': { className: 'mode-badge-chat', icon: 'ri-chat-3-line', label: '聊天室模式' },
      'panel': { className: 'mode-badge-panel', icon: 'ri-group-2-line', label: '专家会诊模式' },
      'standalone': { className: 'mode-badge-standalone', icon: 'ri-user-3-line', label: '独立模式' }
    };
    return badges[mode] || badges['chat-room'];
  };

  const modeBadge = getModeBadge(collaborationMode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showMentionList) {
          e.preventDefault();
          selectMention(filteredAgents[mentionIndex]);
          return;
      }
      e.preventDefault();
      onSendMessage();
    }
    // Mention Navigation
    if (showMentionList) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionIndex(prev => (prev + 1) % filteredAgents.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length);
        } else if (e.key === 'Escape') {
            setShowMentionList(false);
        }
    }
  };

  const handleInputChange = (e) => {
      const value = e.target.value;
      setInput(value);
      onTyping();

      // Check for @ mention
      const lastAt = value.lastIndexOf('@');
      if (lastAt !== -1) {
          const query = value.slice(lastAt + 1);
          if ((lastAt === 0 || value[lastAt - 1] === ' ') && !query.includes(' ')) {
              setMentionQuery(query);
              setShowMentionList(true);
              setMentionIndex(0);
          } else {
              setShowMentionList(false);
          }
      } else {
          setShowMentionList(false);
      }
  };

  // 从最近消息中提取上下文关键词
  const contextKeywords = useMemo(() => {
    const recentMessages = messages.slice(-10);
    const keywords = [];
    const keywordPatterns = ['api', 'database', 'design', 'code', 'test', 'deploy', 'review'];

    recentMessages.forEach((msg) => {
      const content = msg.content?.toLowerCase() || '';
      keywordPatterns.forEach((pattern) => {
        if (content.includes(pattern) && !keywords.includes(pattern)) {
          keywords.push(pattern);
        }
      });
    });

    return keywords;
  }, [messages]);

  const selectMention = (agent) => {
      if (!agent) return;
      const lastAt = input.lastIndexOf('@');
      const newValue = input.slice(0, lastAt) + `@${agent.name} ` + input.slice(lastAt + mentionQuery.length + 1);
      setInput(newValue);
      setShowMentionList(false);
      inputRef.current?.focus();
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
  };
  const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
  };
  const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          handleImageUpload({ target: { files: files } });
      }
  };

  return (
    <div
        className="flex-1 flex flex-col bg-gradient-bg h-full relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
          <div className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-purple-500 border-dashed m-4 rounded-2xl">
              <div className="text-purple-300 font-bold text-xl bg-gray-900/80 px-6 py-4 rounded-xl shadow-lg">
                  释放以上传文件
              </div>
          </div>
      )}

      {/* Header - 赛博风格 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${roomInfo.color || 'bg-gradient-to-br from-cyan-500 to-blue-500'} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
              {roomInfo.icon || <i className="ri-chat-3-line" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">{roomInfo.name}</h2>
                <span className={`${modeBadge.className} px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1`}>
                  <i className={modeBadge.icon}></i>
                  {modeBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex -space-x-1.5">
                   <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] text-white">A</div>
                   <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] text-white">AI</div>
                </div>
                <span className="text-sm text-white/40">{roomInfo.memberCount || 2} 位成员</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white" title="搜索消息">
              <i className="ri-search-line text-lg" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white" title="通知设置">
              <i className="ri-notification-3-line text-lg" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white" title="更多选项">
              <i className="ri-more-fill text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages - 赛博风格 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* Date Divider */}
        <div className="flex items-center justify-center mb-4">
            <span className="text-xs text-white/30 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
              今天 {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>

        {messages.map((msg, idx) => {
            const isOwn = msg.sender === currentUser;
            const senderInfo = agentList.find(a => a.id === msg.sender) || { name: msg.sender, id: msg.sender };
            const repliedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
            const senderType = senderInfo.isBot ? 'ai' : 'user';

            return (
                <MessageBubble
                    key={msg.id || idx}
                    message={msg}
                    isOwn={isOwn}
                    senderName={senderInfo.name}
                    avatar={senderInfo.avatar}
                    avatarColor={senderInfo.color}
                    onReply={(message) => {
                        setReplyingTo(message);
                        inputRef.current?.focus();
                    }}
                    repliedMessage={repliedMsg}
                    senderType={senderType}
                />
            );
        })}

        {/* Typing Indicator - 赛博风格 */}
        {typingAgents.length > 0 && (
             <div className="flex items-start space-x-3">
                {typingAgents.map(agent => {
                    const displayName = agent.name || agent.id;
                    const displayAvatar = agent.avatar || displayName[0];
                    const displayColor = agent.color || 'bg-gray-400';

                    return (
                        <div
                            key={agent.id}
                            className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-white/10"
                        >
                            <div className={`w-6 h-6 ${displayColor} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`}>
                                {displayAvatar}
                            </div>
                            <span className="text-sm text-white/70">{displayName} 正在输入...</span>
                        </div>
                    );
                })}
             </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - 赛博风格 */}
      <div className="glass-panel border-t border-white/5 p-6">
        {/* Replying Banner */}
        {replyingTo && (
            <div className="mb-3 px-4 py-2 bg-white/5 rounded-xl flex justify-between items-center border-l-4 border-purple-500 shadow-sm animate-slide-up">
                <div className="text-xs text-white/60 truncate flex-1">
                    <span className="font-bold mr-1 text-purple-400">回复 {replyingTo.sender}:</span>
                    {replyingTo.content}
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white/70 ml-2">
                    <i className="ri-close-line"></i>
                </button>
            </div>
        )}

        <div className="flex items-end gap-3 relative">
            {/* Mention Suggestions Popup */}
            {showMentionList && (
                <SmartMentionPicker
                    agents={agentList}
                    query={mentionQuery}
                    contextKeywords={contextKeywords}
                    onSelect={(agent) => {
                        selectMention(agent);
                    }}
                    onClose={() => setShowMentionList(false)}
                />
            )}

            {/* Emoji & Attachment */}
            <div className="relative">
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
                >
                    <i className="ri-emotion-line text-xl"></i>
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 glass-panel rounded-xl shadow-lg border border-white/10 p-4 z-10">
                        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {emojiList.map((emoji, idx) => (
                                <button key={idx} onClick={() => handleEmojiSelect(emoji)} className="text-xl hover:bg-white/10 rounded p-1 transition-colors">{emoji}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
                >
                    <i className="ri-image-line text-xl"></i>
                </button>
                <input ref={fileInputRef} type="file" multiple onChange={handleImageUpload} className="hidden" />
                {showImagePicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 glass-panel rounded-xl shadow-lg border border-white/10 p-4 z-10">
                        <div className="mb-2 flex justify-between items-center">
                            <span className="text-xs font-medium text-white/50">上传文件/图片</span>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-purple-400 hover:text-purple-300">选择文件</button>
                        </div>
                        {uploadedImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {uploadedImages.map((img, idx) => (
                                    <img key={idx} src={img.url} onClick={() => handleImageSelect(img.url)} className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" />
                                ))}
                            </div>
                        ) : <div className="text-center text-white/30 text-xs py-4">暂无文件</div>}
                    </div>
                )}
            </div>

            <div className="flex-1 relative">
                <div className="input-gradient border border-white/10 rounded-2xl px-5 py-4 transition-all">
                    <textarea
                        ref={inputRef}
                        placeholder="输入消息... (输入 @ 提及，/ 输入指令)"
                        className="w-full bg-transparent border-0 text-white placeholder-white/30 focus:ring-0 focus:outline-none resize-none text-base leading-relaxed"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        rows="1"
                    />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-xs text-white/30">按 Enter 发送</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10 transition-all text-xs flex items-center gap-1">
                                <i className="ri-magic-line"></i> AI 润色
                            </button>
                            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10 transition-all text-xs flex items-center gap-1">
                                <i className="ri-at-line"></i> 快速 @
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={onSendMessage}
                className="p-4 btn-primary text-white rounded-2xl shadow-lg flex-shrink-0"
            >
                <i className="ri-send-plane-2-fill text-xl"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
