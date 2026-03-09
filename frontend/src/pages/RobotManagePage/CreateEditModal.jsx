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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#1d1d1f]">
            {isCreateMode ? '部署新机器人' : '配置机器人'}
          </h3>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f]">✕</button>
        </div>

        <div className="space-y-5">
          {/* One-API Info */}
          {oneApiStatus.configured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <span className="font-medium">ℹ️ One-API 已启用:</span> 机器人将自动在 One-API 中创建独立的渠道和令牌
              </p>
            </div>
          )}

          {/* One-API Channel Mode Toggle */}
          {showOneApiMode && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                    <div className={`block w-10 h-6 rounded-full transition-colors ${useOneApiChannel ? 'bg-[#007aff]' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useOneApiChannel ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-[#1d1d1f]">从 One-API 渠道选择</span>
                </label>
                <span className="text-xs text-[#86868b]">
                  {useOneApiChannel ? '使用已有渠道' : '手动配置'}
                </span>
              </div>
            </div>
          )}

          {/* 1. Basic Info */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">机器人名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={isCreateMode ? "例如：数据分析助理" : ""}
              className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
            />
          </div>

          {useOneApiChannel ? (
            // One-API Channel Selection Mode
            <>
              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">选择 One-API 渠道</label>
                <select
                  value={selectedChannel || ''}
                  onChange={(e) => handleChannelSelect(e.target.value)}
                  disabled={loadingChannels}
                  className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all appearance-none disabled:bg-gray-100"
                >
                  <option value="">选择 One-API 渠道</option>
                  {oneApiChannels.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name} (类型：{ch.type})</option>
                  ))}
                </select>
                {loadingChannels && (
                  <p className="text-xs text-[#86868b] mt-1.5">正在加载渠道列表...</p>
                )}
              </div>

              {/* Model Selection */}
              {selectedChannel && (
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">选择模型</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all appearance-none"
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
            // Manual Configuration Mode
            <>
              {/* 2. Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">模型服务商 (Provider)</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PROVIDER_CONFIG).map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => setFormData({...formData, provider: provider.id})}
                      className={`
                        cursor-pointer p-3 rounded-xl border flex items-center space-x-3 transition-all
                        ${formData.provider === provider.id
                          ? 'border-[#007aff] bg-[#007aff]/5 ring-1 ring-[#007aff]'
                          : 'border-[#d2d2d7] hover:bg-[#f5f5f7]'}
                      `}
                    >
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="text-sm font-medium text-[#1d1d1f]">{provider.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Variant Selection */}
              {PROVIDER_CONFIG[formData.provider].variants.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">服务类型 (Variant)</label>
                  <select
                    value={formData.variant}
                    onChange={(e) => setFormData({...formData, variant: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all appearance-none"
                  >
                    {PROVIDER_CONFIG[formData.provider].variants.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Model Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">模型 (Model)</label>
                {PROVIDER_CONFIG[formData.provider].models.length > 0 ? (
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all appearance-none"
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
                    className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                  />
                )}
              </div>

              {/* 5. API Key Input */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">API 密钥 (API Key)</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                />
                {mode === 'edit' && (
                  <p className="text-xs text-[#86868b] mt-1.5">留空则保持原有配置不变</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[#f5f5f7] flex justify-end space-x-3">
          {useOneApiChannel ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleChannelSubmit}
                disabled={!formData.name || !selectedChannel || !formData.model}
                className={`px-6 py-2.5 rounded-lg bg-[#007aff] text-white font-medium hover:bg-[#0066cc] transition-colors shadow-sm ${
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
                className={`px-4 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors flex items-center space-x-2 ${
                  (testingConnection || !formData.apiKey) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {testingConnection ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full"></div>
                    <span>测试中...</span>
                  </>
                ) : (
                  <span>⚡ 测试连接</span>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={onSubmit}
                disabled={testingConnection}
                className="px-6 py-2.5 rounded-lg bg-[#007aff] text-white font-medium hover:bg-[#0066cc] transition-colors shadow-sm"
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
