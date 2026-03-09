import React from 'react';

/**
 * 上下文预览组件
 * 显示发送给 AI 的完整上下文内容
 */
const ContextPreview = ({ context, onClose }) => {
  if (!context) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gray-900/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden fade-in-scale">
        {/* 头部 */}
        <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-code-s-slash-line text-purple-400 text-xl" />
            <div>
              <h3 className="text-base font-semibold text-white">上下文预览</h3>
              <p className="text-xs text-white/40">发送给 AI 的完整上下文</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl btn-secondary text-white/60 hover:text-white transition-all"
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
                <i className="ri-settings-4-line text-purple-400 text-sm" />
                <span className="text-sm font-medium text-white/80">系统提示</span>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">
                  {context.systemPrompt}
                </pre>
              </div>
            </div>
          )}

          {/* 全局记忆 */}
          {context.globalMemory && context.globalMemory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-global-line text-pink-400 text-sm" />
                <span className="text-sm font-medium text-white/80">全局记忆</span>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <ul className="text-sm text-white/70 space-y-1">
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
                <i className="ri-home-4-line text-blue-400 text-sm" />
                <span className="text-sm font-medium text-white/80">房间上下文</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                {context.roomContext.goal && (
                  <div className="mb-3">
                    <span className="text-xs text-white/40">目标：</span>
                    <p className="text-sm text-white/70">{context.roomContext.goal}</p>
                  </div>
                )}
                {context.roomContext.decisions && context.roomContext.decisions.length > 0 && (
                  <div>
                    <span className="text-xs text-white/40">已做决策：</span>
                    <ul className="text-sm text-white/70 space-y-1 mt-1">
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
                <i className="ri-file-list-3-line text-emerald-400 text-sm" />
                <span className="text-sm font-medium text-white/80">会话记忆</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ul className="text-sm text-white/70 space-y-1">
                  {context.sessionMemory.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">{item.status === 'done' ? '✓' : '○'}</span>
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
                <i className="ri-chat-history-line text-amber-400 text-sm" />
                <span className="text-sm font-medium text-white/80">对话历史</span>
                <span className="text-xs text-white/40">({context.conversationHistory.length} 条)</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                {context.conversationHistory.slice(-5).map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-xs text-white flex-shrink-0">
                      {msg.sender?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-white/40 mr-2">{msg.sender}</span>
                      <span className="text-sm text-white/70">{msg.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="glass-panel border-t border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>Token 估算：{context.estimatedTokens || 0}</span>
            <span>消息数：{context.conversationHistory?.length || 0}</span>
          </div>
          <button className="px-4 py-2 btn-primary text-white rounded-xl text-sm font-medium flex items-center gap-2">
            <i className="ri-file-copy-line" />
            复制上下文
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextPreview;
