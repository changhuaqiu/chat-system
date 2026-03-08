import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from '../Message/MessageBubble';

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
  inputRef
}) => {
  const messagesEndRef = useRef(null);
  
  // Mention Logic
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

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
          // Only show if @ is at start or preceded by space, and query has no spaces
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

  const filteredAgents = agentList.filter(agent => 
      agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) || 
      agent.id.toLowerCase().includes(mentionQuery.toLowerCase())
  );

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
          // Pass to parent handler (assuming single file for now or handle list)
          // Since handleImageUpload expects an event with target.files, we mock it
          handleImageUpload({ target: { files: files } });
      }
  };

  return (
    <div 
        className="flex-1 flex flex-col bg-white h-full relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-2xl">
              <div className="text-blue-600 font-bold text-xl bg-white/80 px-6 py-4 rounded-xl shadow-lg">
                  释放以上传文件
              </div>
          </div>
      )}

      {/* Header */}
      <div className="border-b border-[#e5e5ea] px-6 py-4 bg-[#fafafa]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${roomInfo.color || 'bg-[#00c7be]'} rounded-xl flex items-center justify-center text-white text-lg shadow-sm`}>
              {roomInfo.icon || '💬'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f]">{roomInfo.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {/* Member avatars preview */}
                <div className="flex -space-x-1.5">
                   {/* Mock avatars */}
                   <div className="w-6 h-6 bg-[#007aff] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">A</div>
                   <div className="w-6 h-6 bg-[#af52de] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">AI</div>
                </div>
                <span className="text-sm text-[#8e8e93]">{roomInfo.memberCount || 2} 位成员</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#f0f0f5] rounded-lg transition-colors" title="搜索消息">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <button className="p-2 hover:bg-[#f0f0f5] rounded-lg transition-colors" title="通知设置">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            <button className="p-2 hover:bg-[#f0f0f5] rounded-lg transition-colors" title="更多选项">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f5f5f7] space-y-5">
        {/* Date Divider (Mock) */}
        <div className="flex items-center justify-center">
            <span className="text-xs text-[#8e8e93] bg-[#e5e5ea] px-3 py-1 rounded-full">今天 {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        {messages.map((msg, idx) => {
            const isOwn = msg.sender === currentUser;
            const senderInfo = agentList.find(a => a.id === msg.sender) || { name: msg.sender, id: msg.sender };
            const repliedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;

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
                />
            );
        })}

        {/* Typing Indicator - Shows detailed bot info */}
        {typingAgents.length > 0 && (
             <div className="flex items-start space-x-3">
                {typingAgents.map(agent => {
                    const displayName = agent.name || agent.id;
                    const displayAvatar = agent.avatar || displayName[0];
                    const displayColor = agent.color || 'bg-gray-400';

                    return (
                        <div
                            key={agent.id}
                            className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100"
                        >
                            <div className={`w-6 h-6 ${displayColor} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`}>
                                {displayAvatar}
                            </div>
                            <span className="text-sm text-gray-600">{displayName} 正在输入...</span>
                        </div>
                    );
                })}
             </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-[#e5e5ea] p-4 bg-[#fafafa]">
        {/* Replying Banner */}
        {replyingTo && (
            <div className="mb-3 px-4 py-2 bg-white rounded-lg flex justify-between items-center border-l-4 border-[#007aff] shadow-sm animate-slide-up">
                <div className="text-xs text-gray-600 truncate flex-1">
                    <span className="font-bold mr-1 text-[#007aff]">回复 {replyingTo.sender}:</span>
                    {replyingTo.content}
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        )}

        <div className="flex items-end gap-3 relative">
            {/* Mention Suggestions Popup */}
            {showMentionList && filteredAgents.length > 0 && (
                <div className="absolute bottom-full left-12 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
                    <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                        提及成员
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredAgents.map((agent, idx) => (
                            <button
                                key={agent.id}
                                onClick={() => selectMention(agent)}
                                className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-blue-50 transition-colors ${idx === mentionIndex ? 'bg-blue-50' : ''}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${agent.color || 'bg-blue-500'}`}>
                                    {agent.name[0]}
                                </div>
                                <span className="text-sm text-gray-800">{agent.name}</span>
                                <span className="text-xs text-gray-400 ml-auto">{agent.id}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Emoji & Attachment */}
            <div className="relative">
                <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 hover:bg-[#f0f0f5] rounded-xl transition-colors text-[#8e8e93] hover:text-[#1d1d1f]"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {emojiList.map((emoji, idx) => (
                                <button key={idx} onClick={() => handleEmojiSelect(emoji)} className="text-xl hover:bg-gray-100 rounded p-1">{emoji}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button 
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="p-2.5 hover:bg-[#f0f0f5] rounded-xl transition-colors text-[#8e8e93] hover:text-[#1d1d1f]"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <input ref={fileInputRef} type="file" multiple onChange={handleImageUpload} className="hidden" />
                {showImagePicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                        <div className="mb-2 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">上传文件/图片</span>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#007aff]">选择文件</button>
                        </div>
                        {uploadedImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {uploadedImages.map((img, idx) => (
                                    <img key={idx} src={img.url} onClick={() => handleImageSelect(img.url)} className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80" />
                                ))}
                            </div>
                        ) : <div className="text-center text-gray-400 text-xs py-4">暂无文件</div>}
                    </div>
                )}
            </div>

            <div className="flex-1 relative">
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="输入消息... (输入 @ 提及, / 输入指令)" 
                    className="w-full bg-[#f0f0f5] border-0 rounded-2xl px-5 py-3.5 text-[#1d1d1f] placeholder-[#8e8e93] focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all outline-none"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <button 
                onClick={onSendMessage}
                className="p-3 bg-[#007aff] text-white rounded-xl hover:bg-[#0066cc] transition-all shadow-sm flex-shrink-0"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
