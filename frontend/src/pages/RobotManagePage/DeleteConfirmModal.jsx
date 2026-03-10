import React from 'react';

export const DeleteConfirmModal = ({ showDeleteConfirm, handleDeleteBot, setShowDeleteConfirm }) => {
  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-bg-card w-full max-w-md p-8 shadow-pixel-xl border-4 border-border">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-pixel-accent-pink/20 border-4 border-pixel-accent-pink flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-pixel-title text-white">确认删除</h3>
            <p className="text-sm text-pixel-gray font-pixel-body">此操作将删除机器人及其 One-API 渠道配置</p>
          </div>
        </div>

        <div className="bg-bg-input p-4 mb-6 border-4 border-border">
          <p className="text-sm text-white font-pixel-body">
            确定要删除机器人 <span className="font-pixel-title text-pixel-accent-purple">"{showDeleteConfirm.name}"</span> 吗？
          </p>
          <p className="text-xs text-pixel-gray mt-2 font-pixel-body">
            删除后，该机器人的 One-API 渠道和令牌也将被清除。
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-6 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => handleDeleteBot(showDeleteConfirm.id)}
            className="px-6 py-2.5 bg-pixel-accent-pink text-white font-pixel-title hover:bg-pixel-accent-pink/80 transition-colors shadow-pixel-sm"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
