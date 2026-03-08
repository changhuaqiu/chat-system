import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

function CreateChatroomPage() {
  const navigate = useNavigate();
  const [chatroomName, setChatroomName] = useState('');
  const [chatroomType, setChatroomType] = useState('free');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatroomName.trim()) {
      alert('请输入聊天室名称');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiService.createRoom(
        chatroomName,
        description,
        chatroomType,
        'admin'
      );
      
      if (result.success) {
        alert('聊天室创建成功！');
        navigate('/chat/' + result.room.id);
      }
    } catch (error) {
      console.error('创建聊天室失败:', error);
      alert('创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">创建新聊天室</h1>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 聊天室名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              聊天室名称
            </label>
            <input
              type="text"
              value={chatroomName}
              onChange={(e) => setChatroomName(e.target.value)}
              placeholder="例如：公共讨论区、客服支持群"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 聊天室类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              聊天室类型
            </label>
            <div className="space-y-3">
              {/* 自由聊天室 */}
              <label
                className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                  chatroomType === 'free'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="chatroomType"
                  value="free"
                  checked={chatroomType === 'free'}
                  onChange={(e) => setChatroomType(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    <h4 className="font-bold text-gray-800">自由聊天室</h4>
                  </div>
                  <p className="text-gray-500 text-sm">
                    所有 Agent 都可以自由发言，不需要 @ 触发
                  </p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• 适合公共聊天室、讨论区</li>
                    <li>• Agent 可以主动发言</li>
                    <li>• 用户可以与任何 Agent 交互</li>
                  </ul>
                </div>
              </label>

              {/* 需要 @ 的聊天室 */}
              <label
                className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                  chatroomType === '@only'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="chatroomType"
                  value="@only"
                  checked={chatroomType === '@only'}
                  onChange={(e) => setChatroomType(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <h4 className="font-bold text-gray-800">需要 @ 的聊天室</h4>
                  </div>
                  <p className="text-gray-500 text-sm">
                    @ Agent 来触发回复，Agent 不会主动发言
                  </p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• 适合私密聊天室、客服群</li>
                    <li>• Agent 只在被 @ 时才能回复</li>
                    <li>• 避免无关的自动回复</li>
                  </ul>
                </div>
              </label>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简述这个聊天室的目的..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {submitting ? '创建中...' : '创建聊天室'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateChatroomPage;
