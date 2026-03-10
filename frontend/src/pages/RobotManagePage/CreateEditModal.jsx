import React from 'react';
import { PROVIDER_CONFIG } from './constants';

export const CreateEditModal = ({
  mode,
  formData,
  setFormData,
  onClose,
  onTest,
  onSubmit,
  testingConnection,
  oneApiStatus,
  useOneApiChannel,
  setUseOneApiChannel,
  oneApiChannels,
  loadingChannels,
  selectedChannel,
  handleChannelSelect,
  channelModels,
  onSubmitFromChannel,
  setSelectedChannel,
  setChannelModels
}) => {
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const showOneApiMode = oneApiStatus.configured;

  const handleChannelSubmit = () => {
    if (isEditMode && useOneApiChannel && selectedChannel) {
      const channel = oneApiChannels.find(c => c.id === selectedChannel);
      onSubmit({
        ...formData,
        provider: 'oneapi',
        config: {
          model: formData.model,
          baseUrl: channel?.baseUrl,
          apiKey: channel?.token || formData.apiKey,
        }
      });
    } else {
      onSubmitFromChannel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-bg-card w-full max-w-lg p-8 shadow-pixel-xl border-4 border-border max-h-[90vh] overflow-y-auto pixel-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-pixel-title text-white">
            {isCreateMode ? '部署新机器人' : '配置机器人'}
          </h3>
          <button onClick={onClose} className="text-pixel-gray hover:text-white transition-colors">✕</button>
        </div>

        <div className="space-y-5">
          {/* One-API Info */}
          {oneApiStatus.configured && (
            <div className="bg-pixel-accent-cyan/10 border-4 border-pixel-accent-cyan/50 p-3">
              <p className="text-xs text-pixel-accent-cyan font-pixel-body">
                <span className="font-pixel-title">ℹ️ One-API 已启用:</span> 机器人将自动在 One-API 中创建独立的渠道和令牌
              </p>
            </div>
          )}

          {/* One-API Channel Mode Toggle */}
          {showOneApiMode && (
            <div className="bg-bg-secondary border-4 border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={useOneApiChannel}
                      onChange={(e) => {
                        setUseOneApiChannel(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedChannel(null);
                          setChannelModels([]);
                        }
                      }}
                    />
                    <div className={`block w-10 h-6 transition-colors border-4 ${useOneApiChannel ? 'bg-pixel-accent-purple border-pixel-accent-purple' : 'bg-bg-input border-border'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-3 h-3 transition-transform ${useOneApiChannel ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-pixel-title text-white">从 One-API 渠道选择</span>
                </label>
                <span className="text-xs text-pixel-gray font-pixel-body">
                  {useOneApiChannel ? '使用已有渠道' : '手动配置'}
                </span>
              </div>
            </div>
          )}

          {/* 1. Basic Info */}
          <div>
            <label className="block text-sm font-pixel-title text-white mb-1.5">机器人名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={isCreateMode ? "例如：数据分析助理" : ""}
              className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
            />
          </div>

          {useOneApiChannel ? (
            <>
              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">选择 One-API 渠道</label>
                <select
                  value={selectedChannel || ''}
                  onChange={(e) => handleChannelSelect(e.target.value)}
                  disabled={loadingChannels}
                  className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors appearance-none disabled:opacity-50 font-pixel-body"
                >
                  <option value="">选择 One-API 渠道</option>
                  {oneApiChannels.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name} (类型：{ch.type})</option>
                  ))}
                </select>
                {loadingChannels && (
                  <p className="text-xs text-pixel-gray mt-1.5 font-pixel-body">正在加载渠道列表...</p>
                )}
              </div>

              {/* Model Selection */}
              {selectedChannel && (
                <div>
                  <label className="block text-sm font-pixel-title text-white mb-1.5">选择模型</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors appearance-none font-pixel-body"
                  >
                    <option value="">选择模型</option>
                    {channelModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 2. Provider Selection */}
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">模型服务商 (Provider)</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PROVIDER_CONFIG).map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => setFormData({...formData, provider: provider.id})}
                      className={`
                        cursor-pointer p-3 border-4 flex items-center space-x-3 transition-colors
                        ${formData.provider === provider.id
                          ? 'border-pixel-primary bg-pixel-primary/20'
                          : 'border-border hover:bg-bg-secondary'}
                      `}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="text-sm font-pixel-body text-white">{provider.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Variant Selection */}
              {PROVIDER_CONFIG[formData.provider].variants.length > 1 && (
                <div>
                  <label className="block text-sm font-pixel-title text-white mb-1.5">服务类型 (Variant)</label>
                  <select
                    value={formData.variant}
                    onChange={(e) => setFormData({...formData, variant: e.target.value})}
                    className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors appearance-none font-pixel-body"
                  >
                    {PROVIDER_CONFIG[formData.provider].variants.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Model Selection */}
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">模型 (Model)</label>
                {PROVIDER_CONFIG[formData.provider].models.length > 0 ? (
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors appearance-none font-pixel-body"
                  >
                    {PROVIDER_CONFIG[formData.provider].models.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="请输入模型名称 (e.g., gpt-4, qwen-max)"
                    className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
                  />
                )}
              </div>

              {/* 5. API Key Input */}
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">API 密钥 (API Key)</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
                />
                {mode === 'edit' && (
                  <p className="text-xs text-pixel-gray mt-1.5 font-pixel-body">留空则保持原有配置不变</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t-4 border-border flex justify-end space-x-3">
          {useOneApiChannel ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleChannelSubmit}
                disabled={!formData.name || !selectedChannel || !formData.model}
                className={`px-6 py-2.5 bg-pixel-accent-purple text-white font-pixel-title hover:bg-pixel-accent-purple/80 transition-colors shadow-pixel-sm ${
                  (!formData.name || !selectedChannel || !formData.model) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isEditMode ? '保存配置' : '部署机器人'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onTest}
                disabled={testingConnection || !formData.apiKey}
                className={`px-4 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors flex items-center space-x-2 ${
                  (testingConnection || !formData.apiKey) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {testingConnection ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-4 border-white border-t-transparent"></div>
                    <span>测试中...</span>
                  </>
                ) : (
                  <span>⚡ 测试连接</span>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={onSubmit}
                disabled={testingConnection}
                className="px-6 py-2.5 btn-primary text-white font-pixel-title"
              >
                {mode === 'create' ? '部署机器人' : '保存配置'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
