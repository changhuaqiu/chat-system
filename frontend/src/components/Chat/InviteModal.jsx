import React, { useState, useEffect } from 'react';

/**
 * 邀请模态框组件 - 像素风格
 */
const InviteModal = ({ isOpen, onClose, roomId }) => {
  if (!isOpen) return null;

  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-bg-card border-8 border-border w-full max-w-md p-6 shadow-pixel-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-pixel-title text-white">邀请成员加入</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-secondary border-4 border-transparent hover:border-border transition-colors"
          >
            <svg className="w-5 h-5 text-pixel-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 border-4 border-pixel-accent-green bg-pixel-accent-green/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pixel-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </div>
          <p className="text-white font-pixel-title mb-1">分享此链接邀请成员</p>
          <p className="text-sm text-pixel-gray font-pixel-body">任何拥有此链接的人都可以加入聊天室。</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 bg-bg-secondary p-2 pl-4 border-4 border-border">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 bg-transparent text-sm text-white outline-none truncate font-pixel-body"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 border-4 text-sm font-pixel-title transition-all ${
                copied
                  ? 'border-pixel-accent-green bg-pixel-accent-green text-white'
                  : 'border-pixel-primary bg-pixel-primary text-white hover:bg-pixel-accent-purple hover:border-pixel-accent-purple'
              }`}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-sm text-pixel-accent-cyan hover:text-pixel-primary font-pixel-body"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
