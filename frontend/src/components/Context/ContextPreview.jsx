import React from 'react';

/**
 * 上下文预览组件 - 像素风格
 * 显示发送给 AI 的完整上下文内容
 */
const ContextPreview = ({ context, onClose }) => {
  if (!context) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80">
      <div className="w-full max-w-3xl bg-bg-card border-8 border-border shadow-pixel-xl overflow-hidden fade-in-scale">
        {/* 头部 */}
        <div className="bg-bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-code-s-slash-line text-pixel-accent-purple text-xl" />
            <div>
              <h3 className="text-base font-pixel-title text-white">上下文预览</h3>
              <p className="text-xs text-pixel-gray font-pixel-body">发送给 AI 的完整上下文</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-4 border-border text-pixel-gray hover:text-white hover:border-pixel-primary transition-colors"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {/* 系统提示 */}
          {context.systemPrompt && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-settings-4-line text-pixel-accent-purple text-sm" />
                <span className="text-sm font-pixel-title text-white">系统提示</span>
              </div>
              <div className="p-4 border-4 border-pixel-accent-purple bg-pixel-accent-purple/20">
                <pre className="text-sm text-white font-pixel-body whitespace-pre-wrap">
                  {context.systemPrompt}
                </pre>
              </div>
            </div>
          )}

          {/* 全局记忆 */}
          {context.globalMemory && context.globalMemory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-global-line text-pixel-accent-pink text-sm" />
                <span className="text-sm font-pixel-title text-white">全局记忆</span>
              </div>
              <div className="p-4 border-4 border-pixel-accent-pink bg-pixel-accent-pink/20">
                <ul className="text-sm text-white font-pixel-body space-y-1">
                  {context.globalMemory.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 房间上下文 */}
          {context.roomContext && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-home-4-line text-pixel-accent-cyan text-sm" />
                <span className="text-sm font-pixel-title text-white">房间上下文</span>
              </div>
              <div className="p-4 border-4 border-pixel-accent-cyan bg-pixel-accent-cyan/20">
                {context.roomContext.goal && (
                  <div className="mb-3">
                    <span className="text-xs text-pixel-gray font-pixel-body">目标：</span>
                    <p className="text-sm text-white font-pixel-body">{context.roomContext.goal}</p>
                  </div>
                )}
                {context.roomContext.decisions && context.roomContext.decisions.length > 0 && (
                  <div>
                    <span className="text-xs text-pixel-gray font-pixel-body">已做决策：</span>
                    <ul className="text-sm text-white font-pixel-body space-y-1 mt-1">
                      {context.roomContext.decisions.map((d, idx) => (
                        <li key={idx}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 会话记忆 */}
          {context.sessionMemory && context.sessionMemory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-file-list-3-line text-pixel-accent-green text-sm" />
                <span className="text-sm font-pixel-title text-white">会话记忆</span>
              </div>
              <div className="p-4 border-4 border-pixel-accent-green bg-pixel-accent-green/20">
                <ul className="text-sm text-white font-pixel-body space-y-1">
                  {context.sessionMemory.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pixel-accent-green">{item.status === 'done' ? '✓' : '○'}</span>
                      <span>{item.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 对话历史 */}
          {context.conversationHistory && context.conversationHistory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-chat-history-line text-pixel-accent-orange text-sm" />
                <span className="text-sm font-pixel-title text-white">对话历史</span>
                <span className="text-xs text-pixel-gray font-pixel-body">({context.conversationHistory.length} 条)</span>
              </div>
              <div className="p-4 border-4 border-pixel-accent-orange bg-pixel-accent-orange/20">
                {context.conversationHistory.slice(-5).map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 border-4 border-pixel-accent-purple bg-pixel-accent-purple flex items-center justify-center text-xs text-white flex-shrink-0">
                      {msg.sender?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-pixel-gray font-pixel-body mr-2">{msg.sender}</span>
                      <span className="text-sm text-white font-pixel-body">{msg.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="bg-bg-card border-t-4 border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-pixel-gray font-pixel-body">
            <span>Token 估算：{context.estimatedTokens || 0}</span>
            <span>消息数：{context.conversationHistory?.length || 0}</span>
          </div>
          <button className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white text-sm font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple flex items-center gap-2 transition-colors">
            <i className="ri-file-copy-line" />
            复制上下文
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextPreview;
