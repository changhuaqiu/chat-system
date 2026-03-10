import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Layout from '../components/Layout';
import ModeSelector from '../components/Collaboration/ModeSelector';

function CreateChatroomPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [collaborationMode, setCollaborationMode] = useState('');
  const [chatroomName, setChatroomName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleModeSelect = (mode) => {
    setCollaborationMode(mode);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

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
        collaborationMode,
        'admin',
        goal
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

  const modeNames = {
    'war-room': '作战室模式',
    'chat-room': '聊天室模式',
    'panel': '专家会诊模式',
    'standalone': '独立模式'
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-4xl">
          {/* 顶部导航 - 像素风格 */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={step === 1 ? onCancel : handleBack}
              className="p-2 btn-secondary text-pixel-gray hover:text-white transition-colors"
            >
              <i className="ri-arrow-left-line text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-pixel-title text-white">
                {step === 1 ? '创建新聊天室' : '房间配置'}
              </h1>
              <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
                {step === 1
                  ? '选择适合你需求的协作模式'
                  : `已选择：${collaborationMode ? modeNames[collaborationMode] : ''}`}
              </p>
            </div>
          </div>

          {/* 步骤 1: 模式选择 */}
          {step === 1 && (
            <div className="fade-in">
              <ModeSelector
                selectedMode={collaborationMode}
                onModeSelect={handleModeSelect}
              />
            </div>
          )}

          {/* 步骤 2: 房间配置 - 像素风格 */}
          {step === 2 && (
            <div className="bg-bg-card p-8 border-4 border-border shadow-pixel-lg fade-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                      房间名称
                    </label>
                    <input
                      type="text"
                      value={chatroomName}
                      onChange={(e) => setChatroomName(e.target.value)}
                      placeholder="输入房间名称..."
                      className="w-full px-4 py-3 bg-bg-input border-4 border-border text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                      目标（可选）
                    </label>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="描述这个房间的目标..."
                      className="w-full px-4 py-3 bg-bg-input border-4 border-border text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                    房间描述
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="描述这个房间的用途..."
                    className="w-full px-4 py-3 bg-bg-input border-4 border-border text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors resize-none font-pixel-body"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-6 border-t-4 border-border">
                  <div className="text-sm text-pixel-gray font-pixel-body">
                    请确认房间信息无误
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 btn-secondary text-pixel-gray font-pixel-title"
                    >
                      返回
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 btn-primary text-white font-pixel-title disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '创建中...' : '创建房间'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CreateChatroomPage;
