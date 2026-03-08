import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [stats, setStats] = useState({
    totalKeys: 0,
    monthlyCalls: 0,
    expiringKeys: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnvironment, setNewKeyEnvironment] = useState('production');
  const [visibleKeys, setVisibleKeys] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [quotaSettings, setQuotaSettings] = useState({
    quotaLimit: -1,
    rateLimit: 60,
    modelQuotas: []
  });
  const [usageStats, setUsageStats] = useState({ stats: [], ranking: [] });
  const [statsDays, setStatsDays] = useState(7);
  const [newModelQuota, setNewModelQuota] = useState({ model: '', requestLimit: -1, rateLimit: 60 });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApiKeys();
      const keys = response.keys || response.apiKeys || [];
      setApiKeys(keys);
      setStats({
        totalKeys: keys.length,
        monthlyCalls: 2300000, // Mock
        expiringKeys: keys.filter(k => k.status === 'expiring').length
      });
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) {
      alert('请输入密钥名称');
      return;
    }
    try {
      await apiService.createApiKey(newKeyName, newKeyEnvironment, 'active');
      alert('API Key 创建成功');
      setShowCreateModal(false);
      setNewKeyName('');
      setNewKeyEnvironment('production');
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('创建失败：' + (error.response?.data?.error || error.message));
    }
  };

  const handleOpenQuotaModal = async (key) => {
    setSelectedKey(key);
    try {
      const quotaResponse = await apiService.getApiKeyQuota(key.key);
      const modelQuotasResponse = await apiService.getModelQuotas(key.key);

      setQuotaSettings({
        quotaLimit: quotaResponse.quota?.quota_limit || -1,
        rateLimit: quotaResponse.quota?.rate_limit || 60,
        quotaUsed: quotaResponse.quota?.quota_used || 0,
        modelQuotas: modelQuotasResponse.quota || []
      });
      setShowQuotaModal(true);
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    }
  };

  const handleSaveQuotaSettings = async () => {
    try {
      await apiService.setApiKeyQuota(selectedKey.key, quotaSettings.quotaLimit, quotaSettings.rateLimit);
      alert('配额设置已保存');
      setShowQuotaModal(false);
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to save quota:', error);
      alert('保存失败：' + error.message);
    }
  };

  const handleAddModelQuota = async () => {
    if (!newModelQuota.model) {
      alert('请选择模型');
      return;
    }
    try {
      await apiService.setModelQuota(
        selectedKey.key,
        newModelQuota.model,
        newModelQuota.requestLimit,
        newModelQuota.rateLimit
      );
      // Refresh model quotas
      const modelQuotasResponse = await apiService.getModelQuotas(selectedKey.key);
      setQuotaSettings(prev => ({
        ...prev,
        modelQuotas: modelQuotasResponse.quota || []
      }));
      setNewModelQuota({ model: '', requestLimit: -1, rateLimit: 60 });
    } catch (error) {
      console.error('Failed to add model quota:', error);
      alert('添加失败：' + error.message);
    }
  };

  const handleResetQuota = async (model) => {
    try {
      await apiService.resetQuota(selectedKey.key, model);
      alert('配额已重置');
      handleOpenQuotaModal(selectedKey);
    } catch (error) {
      console.error('Failed to reset quota:', error);
      alert('重置失败：' + error.message);
    }
  };

  const handleOpenStatsModal = async (key) => {
    setSelectedKey(key);
    await fetchUsageStats(key.key, statsDays);
    setShowStatsModal(true);
  };

  const fetchUsageStats = async (key, days) => {
    try {
      const response = await apiService.getUsageStats(key, days);
      setUsageStats({
        stats: response.stats || [],
        ranking: response.ranking || []
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const handleStatsDaysChange = (days) => {
    setStatsDays(days);
    if (selectedKey) {
      fetchUsageStats(selectedKey.key, days);
    }
  };

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleDeleteKey = async (key) => {
    if (!confirm(`确定要删除 API Key "${key.name || key.key}" 吗？此操作不可撤销。`)) {
      return;
    }
    try {
      await apiService.deleteApiKey(key.key);
      alert('删除成功');
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to delete key:', error);
      alert('删除失败：' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 font-apple">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">API 密钥</h1>
          <p className="text-[#86868b] mt-1">管理您服务的访问令牌。</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#007aff] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>创建新密钥</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
          <p className="text-sm font-medium text-[#86868b]">密钥总数</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-semibold text-[#1d1d1f]">{stats.totalKeys}</h3>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">本周 +2</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
          <p className="text-sm font-medium text-[#86868b]">月调用量</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-semibold text-[#1d1d1f]">{stats.monthlyCalls.toLocaleString()}</h3>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+18.5%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#f5f5f7]">
          <p className="text-sm font-medium text-[#86868b]">即将过期</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-semibold text-[#1d1d1f]">{stats.expiringKeys}</h3>
            {stats.expiringKeys > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">需要处理</span>
            )}
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#f5f5f7]">
              <tr className="border-b border-[#f5f5f7]">
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">名称</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">令牌 (Token)</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">配额使用</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#86868b]">正在加载密钥...</td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-[#1d1d1f] font-medium">未找到 API 密钥</p>
                    <p className="text-[#86868b] text-sm mt-1">请创建一个密钥以开始使用。</p>
                  </td>
                </tr>
              ) : (
                apiKeys.map((key, idx) => (
                  <tr key={idx} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                          🔑
                        </div>
                        <div>
                          <p className="font-medium text-[#1d1d1f] text-sm">{key.name || '未命名密钥'}</p>
                          <p className="text-xs text-[#86868b]">{key.environment || 'Production'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-[#f5f5f7] px-2 py-1 rounded text-xs font-mono text-[#1d1d1f] border border-[#e5e5e5]">
                          {visibleKeys[idx] ? key.key : `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 6)}`}
                        </code>
                        <button
                          onClick={() => toggleVisibility(idx)}
                          className="text-[#86868b] hover:text-[#007aff] transition-colors"
                        >
                          {visibleKeys[idx] ? '👁️‍🗨️' : '👁️'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-[#86868b] hover:text-[#007aff] transition-colors"
                          title="复制"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#f5f5f7] rounded-full h-2 w-24">
                          <div
                            className="bg-[#007aff] h-2 rounded-full transition-all"
                            style={{ width: key.quota_limit > 0 ? `${Math.min((key.quota_used || 0) / key.quota_limit * 100, 100)}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs text-[#86868b]">
                          {key.quota_limit > 0 ? `${key.quota_used || 0}/${key.quota_limit}` : '无限制'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {key.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          活跃
                        </span>
                      ) : key.status === 'inactive' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          未激活
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          已过期
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#86868b]">
                      {key.created_at ? new Date(key.created_at).toLocaleDateString() : '2024-01-01'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenQuotaModal(key)}
                          className="text-[#86868b] hover:text-[#007aff] transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="配额设置"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleOpenStatsModal(key)}
                          className="text-[#86868b] hover:text-[#007aff] transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="使用统计"
                        >
                          📈
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key)}
                          className="text-[#86868b] hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1d1d1f]">创建 API 密钥</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#86868b] hover:text-[#1d1d1f]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">密钥名称</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="例如：开发服务器"
                  className="w-full px-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">环境</label>
                <select
                  value={newKeyEnvironment}
                  onChange={(e) => setNewKeyEnvironment(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all appearance-none"
                >
                  <option value="production">生产环境 (Production)</option>
                  <option value="development">开发环境 (Development)</option>
                  <option value="test">测试环境 (Test)</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateKey}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#007aff] text-white font-medium hover:bg-[#0066cc] transition-colors shadow-sm"
              >
                创建密钥
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Settings Modal */}
      {showQuotaModal && selectedKey && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl transform transition-all scale-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f]">配额设置</h3>
                <p className="text-sm text-[#86868b] mt-1">{selectedKey.name || selectedKey.key}</p>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className="text-[#86868b] hover:text-[#1d1d1f]">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Total Quota Settings */}
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <h4 className="text-sm font-semibold text-[#1d1d1f] mb-4">总配额设置</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#86868b] mb-1.5">请求配额上限</label>
                    <input
                      type="number"
                      value={quotaSettings.quotaLimit}
                      onChange={(e) => setQuotaSettings(prev => ({ ...prev, quotaLimit: parseInt(e.target.value) || -1 }))}
                      placeholder="-1 表示无限制"
                      className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                    />
                    <p className="text-xs text-[#86868b] mt-1">已使用：{quotaSettings.quotaUsed || 0}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#86868b] mb-1.5">限流 (RPM)</label>
                    <input
                      type="number"
                      value={quotaSettings.rateLimit}
                      onChange={(e) => setQuotaSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 60 }))}
                      className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                    />
                    <p className="text-xs text-[#86868b] mt-1">超额后降至此限流</p>
                  </div>
                </div>
                <button
                  onClick={() => handleResetQuota()}
                  className="mt-3 text-xs text-[#007aff] hover:text-[#0066cc]"
                >
                  🔄 重置总配额计数
                </button>
              </div>

              {/* Model Quota Settings */}
              <div>
                <h4 className="text-sm font-semibold text-[#1d1d1f] mb-4">分模型配额</h4>

                {/* Add new model quota */}
                <div className="bg-[#f5f5f7] rounded-xl p-4 mb-4">
                  <p className="text-xs font-medium text-[#86868b] mb-2">添加模型配额</p>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newModelQuota.model}
                      onChange={(e) => setNewModelQuota(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="模型名称 (如 qwen-max)"
                      className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                    />
                    <input
                      type="number"
                      value={newModelQuota.requestLimit}
                      onChange={(e) => setNewModelQuota(prev => ({ ...prev, requestLimit: parseInt(e.target.value) || -1 }))}
                      placeholder="配额上限"
                      className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
                    />
                    <button
                      onClick={handleAddModelQuota}
                      className="px-4 py-2 bg-[#007aff] text-white rounded-lg text-sm font-medium hover:bg-[#0066cc] transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {/* Model quotas list */}
                <div className="space-y-2">
                  {quotaSettings.modelQuotas && quotaSettings.modelQuotas.length > 0 ? (
                    quotaSettings.modelQuotas.map((mq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{mq.model_name}</p>
                          <p className="text-xs text-[#86868b]">
                            已使用：{mq.request_used || 0} / {mq.request_limit > 0 ? mq.request_limit : '无限制'}
                            {mq.request_limit > 0 && (
                              <span className="ml-2"> (限流：{mq.rate_limit} RPM)</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleResetQuota(mq.model_name)}
                          className="text-xs text-[#007aff] hover:text-[#0066cc]"
                        >
                          🔄 重置
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#86868b] text-center py-4">暂无分模型配额设置</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#d2d2d7] text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveQuotaSettings}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#007aff] text-white font-medium hover:bg-[#0066cc] transition-colors shadow-sm"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats Modal */}
      {showStatsModal && selectedKey && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl transform transition-all scale-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f]">使用统计</h3>
                <p className="text-sm text-[#86868b] mt-1">{selectedKey.name || selectedKey.key}</p>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="text-[#86868b] hover:text-[#1d1d1f]">
                ✕
              </button>
            </div>

            {/* Days filter */}
            <div className="flex space-x-2 mb-6">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => handleStatsDaysChange(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statsDays === days
                      ? 'bg-[#007aff] text-white'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5e5]'
                  }`}
                >
                  最近 {days} 天
                </button>
              ))}
            </div>

            {/* Usage Stats Table */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">使用趋势</h4>
              {usageStats.stats && usageStats.stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f5f5f7]">
                      <tr>
                        <th className="px-4 py-2 text-[#86868b]">日期</th>
                        <th className="px-4 py-2 text-[#86868b]">总请求</th>
                        <th className="px-4 py-2 text-green-600">成功</th>
                        <th className="px-4 py-2 text-red-600">失败</th>
                        <th className="px-4 py-2 text-orange-600">限流</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7]">
                      {usageStats.stats.map((stat, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-[#1d1d1f]">{stat.date}</td>
                          <td className="px-4 py-3 text-[#1d1d1f]">{stat.requests}</td>
                          <td className="px-4 py-3 text-green-600">{stat.success || 0}</td>
                          <td className="px-4 py-3 text-red-600">{stat.errors || 0}</td>
                          <td className="px-4 py-3 text-orange-600">{stat.rate_limited || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[#86868b] text-center py-8">暂无使用数据</p>
              )}
            </div>

            {/* Model Usage Ranking */}
            <div>
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">模型使用排行</h4>
              {usageStats.ranking && usageStats.ranking.length > 0 ? (
                <div className="space-y-2">
                  {usageStats.ranking.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#007aff] text-white text-xs flex items-center justify-center font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-[#1d1d1f]">{item.model_name}</span>
                      </div>
                      <span className="text-sm text-[#86868b]">{item.requests} 次请求</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#86868b] text-center py-8">暂无模型使用数据</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#f5f5f7] text-[#1d1d1f] font-medium hover:bg-[#e5e5e5] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysPage;
