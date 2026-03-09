import React from 'react';

export const DeleteConfirmModal = ({ showDeleteConfirm, handleDeleteBot, setShowDeleteConfirm }) => {
  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-panel rounded-2xl w-full max-w-md p-8 shadow-2xl border border-white/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">确认删除</h3>
            <p className="text-sm text-white/40">此操作将删除机器人及其 One-API 渠道配置</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-sm text-white">
            确定要删除机器人 <span className="font-semibold text-purple-400">"{showDeleteConfirm.name}"</span> 吗？
          </p>
          <p className="text-xs text-white/40 mt-2">
            删除后，该机器人的 One-API 渠道和令牌也将被清除。
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-6 py-2.5 rounded-lg border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => handleDeleteBot(showDeleteConfirm.id)}
            className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
