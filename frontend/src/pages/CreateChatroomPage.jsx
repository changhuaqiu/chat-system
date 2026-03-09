import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Layout from '../components/Layout';
import ModeSelector from '../components/Collaboration/ModeSelector';

function CreateChatroomPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 选择模式，2: 填写信息
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
          {/* 顶部导航 */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={step === 1 ? onCancel : handleBack}
              className="p-2 rounded-xl btn-secondary text-white/60 hover:text-white transition-all"
            >
              <i className="ri-arrow-left-line text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {step === 1 ? '创建新聊天室' : '房间配置'}
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {step === 1
                  ? '选择适合你需求的协作模式'
                  : `已选择：${collaborationMode ? modeNames[collaborationMode] : ''}`}
              </p>
            </div>
          </div>

          {/* 步骤 1: 模式选择 */}
          {step === 1 && (
            <div className="fade-in-up">
              <ModeSelector
                selectedMode={collaborationMode}
                onModeSelect={handleModeSelect}
              />
            </div>
          )}

          {/* 步骤 2: 房间配置 */}
          {step === 2 && (
            <div className="glass-panel rounded-2xl p-8 fade-in-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      房间名称
                    </label>
                    <input
                      type="text"
                      value={chatroomName}
                      onChange={(e) => setChatroomName(e.target.value)}
                      placeholder="输入房间名称..."
                      className="w-full px-4 py-3 input-field rounded-xl text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      目标（可选）
                    </label>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="描述这个房间的目标..."
                      className="w-full px-4 py-3 input-field rounded-xl text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    房间描述
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="描述这个房间的用途..."
                    className="w-full px-4 py-3 input-field rounded-xl text-white placeholder-white/30 focus:outline-none resize-none"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="text-sm text-white/30">
                    请确认房间信息无误
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 btn-secondary text-white/70 rounded-xl font-medium"
                    >
                      返回
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 btn-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
