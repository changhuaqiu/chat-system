import React, { useState, useEffect } from 'react';

const InviteModal = ({ isOpen, onClose, roomId }) => {
  if (!isOpen) return null;

  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate a mock or real link based on room ID
      // In production this might come from an API call
      const baseUrl = window.location.origin;
      const mockToken = Math.random().toString(36).substring(2, 15);
      setInviteLink(`${baseUrl}/invite/${roomId || 'general'}?token=${mockToken}`);
      setCopied(false);
    }
  }, [isOpen, roomId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#1d1d1f]">邀请成员加入</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
            <p className="text-[#1d1d1f] font-medium mb-1">分享此链接邀请成员</p>
            <p className="text-sm text-[#8e8e93]">任何拥有此链接的人都可以加入聊天室。</p>
        </div>

        <div className="mb-6">
            <div className="flex items-center gap-2 bg-[#f5f5f7] p-2 pl-4 rounded-xl border border-[#e5e5ea]">
                <input 
                    type="text" 
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-transparent text-sm text-[#1d1d1f] outline-none truncate"
                />
                <button 
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${copied ? 'bg-green-500 text-white' : 'bg-white text-[#1d1d1f] shadow-sm hover:bg-gray-50'}`}
                >
                    {copied ? '已复制' : '复制'}
                </button>
            </div>
        </div>
        
        <div className="text-center">
            <button 
              onClick={onClose}
              className="text-sm text-[#007aff] hover:underline"
            >
              完成
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
