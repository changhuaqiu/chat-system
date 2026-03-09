import React from 'react';

export const DeleteConfirmModal = ({ showDeleteConfirm, handleDeleteBot, setShowDeleteConfirm }) => {
  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1d1d1f]">确认删除</h3>
            <p className="text-sm text-[#86868b]">此操作将删除机器人及其 One-API 渠道配置</p>
          </div>
        </div>

        <div className="bg-[#f5f5f7] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#1d1d1f]">
            确定要删除机器人 <span className="font-semibold">"{showDeleteConfirm.name}"</span> 吗？
          </p>
          <p className="text-xs text-[#86868b] mt-2">
            删除后，该机器人的 One-API 渠道和令牌也将被清除。
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-6 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => handleDeleteBot(showDeleteConfirm.id)}
            className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
