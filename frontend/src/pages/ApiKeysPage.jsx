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
        monthlyCalls: 2300000,
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
    <div className="flex-1 overflow-y-auto bg-bg-primary p-8 font-pixel-body pixel-scrollbar">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-pixel-title text-white tracking-tight">API 密钥</h1>
          <p className="text-pixel-gray mt-1">管理您服务的访问令牌。</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-white px-4 py-2 text-sm font-pixel-title flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>创建新密钥</span>
        </button>
      </header>

      {/* Stats Cards - 像素风格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-card p-6 border-4 border-border shadow-pixel-md">
          <p className="text-sm font-pixel-title text-pixel-gray">密钥总数</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-pixel-title text-white">{stats.totalKeys}</h3>
            <span className="text-xs font-pixel-body text-pixel-accent-green bg-pixel-accent-green/20 px-2 py-1 border-2 border-pixel-accent-green">本周 +2</span>
          </div>
        </div>
        <div className="bg-bg-card p-6 border-4 border-border shadow-pixel-md">
          <p className="text-sm font-pixel-title text-pixel-gray">月调用量</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-pixel-title text-white">{stats.monthlyCalls.toLocaleString()}</h3>
            <span className="text-xs font-pixel-body text-pixel-accent-green bg-pixel-accent-green/20 px-2 py-1 border-2 border-pixel-accent-green">+18.5%</span>
          </div>
        </div>
        <div className="bg-bg-card p-6 border-4 border-border shadow-pixel-md">
          <p className="text-sm font-pixel-title text-pixel-gray">即将过期</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-pixel-title text-white">{stats.expiringKeys}</h3>
            {stats.expiringKeys > 0 && (
              <span className="text-xs font-pixel-body text-pixel-accent-orange bg-pixel-accent-orange/20 px-2 py-1 border-2 border-pixel-accent-orange">需要处理</span>
            )}
          </div>
        </div>
      </div>

      {/* Keys Table - 像素风格 */}
      <div className="bg-bg-card border-4 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-4 border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider">名称</th>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider">令牌 (Token)</th>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider">配额使用</th>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-4 text-xs font-pixel-title text-pixel-gray uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-pixel-gray">正在加载密钥...</td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-white font-pixel-title">未找到 API 密钥</p>
                    <p className="text-pixel-gray text-sm mt-1">请创建一个密钥以开始使用。</p>
                  </td>
                </tr>
              ) : (
                apiKeys.map((key, idx) => (
                  <tr key={idx} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pixel-primary/20 border-4 border-pixel-primary/50 flex items-center justify-center text-pixel-primary">
                          🔑
                        </div>
                        <div>
                          <p className="font-pixel-body text-white text-sm">{key.name || '未命名密钥'}</p>
                          <p className="text-xs text-pixel-gray">{key.environment || 'Production'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-bg-input px-2 py-1 text-xs font-mono text-white border-4 border-border">
                          {visibleKeys[idx] ? key.key : `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 6)}`}
                        </code>
                        <button
                          onClick={() => toggleVisibility(idx)}
                          className="text-pixel-gray hover:text-white transition-colors"
                        >
                          {visibleKeys[idx] ? '👁️‍🗨️' : '👁️'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-pixel-gray hover:text-white transition-colors"
                          title="复制"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-bg-secondary h-3 w-24 border-2 border-border">
                          <div
                            className="bg-pixel-primary h-full transition-all"
                            style={{ width: key.quota_limit > 0 ? `${Math.min((key.quota_used || 0) / key.quota_limit * 100, 100)}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs text-pixel-gray">
                          {key.quota_limit > 0 ? `${key.quota_used || 0}/${key.quota_limit}` : '无限制'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {key.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-pixel-title bg-pixel-accent-green/20 text-pixel-accent-green border-2 border-pixel-accent-green">
                          活跃
                        </span>
                      ) : key.status === 'inactive' ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-pixel-title bg-bg-secondary text-pixel-gray border-2 border-border">
                          未激活
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-pixel-title bg-pixel-accent-orange/20 text-pixel-accent-orange border-2 border-pixel-accent-orange">
                          已过期
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-pixel-gray">
                      {key.created_at ? new Date(key.created_at).toLocaleDateString() : '2024-01-01'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenQuotaModal(key)}
                          className="text-pixel-gray hover:text-white transition-colors p-2 hover:bg-bg-secondary"
                          title="配额设置"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleOpenStatsModal(key)}
                          className="text-pixel-gray hover:text-white transition-colors p-2 hover:bg-bg-secondary"
                          title="使用统计"
                        >
                          📈
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key)}
                          className="text-pixel-gray hover:text-pixel-accent-pink transition-colors p-2 hover:bg-bg-secondary"
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

      {/* Create Modal - 像素风格 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-bg-card w-full max-w-md p-6 shadow-pixel-xl border-4 border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-pixel-title text-white">创建 API 密钥</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-pixel-gray hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">密钥名称</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="例如：开发服务器"
                  className="w-full px-4 py-2 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-pixel-title text-white mb-1.5">环境</label>
                <select
                  value={newKeyEnvironment}
                  onChange={(e) => setNewKeyEnvironment(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors appearance-none"
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
                className="flex-1 px-4 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateKey}
                className="flex-1 px-4 py-2.5 btn-primary text-white font-pixel-title"
              >
                创建密钥
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Settings Modal - 像素风格 */}
      {showQuotaModal && selectedKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-bg-card w-full max-w-2xl p-6 shadow-pixel-xl border-4 border-border max-h-[80vh] overflow-y-auto pixel-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-pixel-title text-white">配额设置</h3>
                <p className="text-sm text-pixel-gray mt-1">{selectedKey.name || selectedKey.key}</p>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className="text-pixel-gray hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-bg-secondary p-4 border-4 border-border">
                <h4 className="text-sm font-pixel-title text-white mb-4">总配额设置</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-pixel-title text-pixel-gray mb-1.5">请求配额上限</label>
                    <input
                      type="number"
                      value={quotaSettings.quotaLimit}
                      onChange={(e) => setQuotaSettings(prev => ({ ...prev, quotaLimit: parseInt(e.target.value) || -1 }))}
                      placeholder="-1 表示无限制"
                      className="w-full px-3 py-2 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors"
                    />
                    <p className="text-xs text-pixel-gray mt-1">已使用：{quotaSettings.quotaUsed || 0}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-pixel-title text-pixel-gray mb-1.5">限流 (RPM)</label>
                    <input
                      type="number"
                      value={quotaSettings.rateLimit}
                      onChange={(e) => setQuotaSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) || 60 }))}
                      className="w-full px-3 py-2 bg-bg-input border-4 border-border text-sm text-white focus:outline-none focus:border-pixel-border-highlight transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-pixel-title text-white mb-4">分模型配额</h4>
                <div className="space-y-2">
                  {quotaSettings.modelQuotas && quotaSettings.modelQuotas.length > 0 ? (
                    quotaSettings.modelQuotas.map((mq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-bg-secondary border-4 border-border">
                        <div>
                          <p className="text-sm font-pixel-body text-white">{mq.model_name}</p>
                          <p className="text-xs text-pixel-gray">
                            已使用：{mq.request_used || 0} / {mq.request_limit > 0 ? mq.request_limit : '无限制'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleResetQuota(mq.model_name)}
                          className="text-xs text-pixel-accent-cyan hover:text-pixel-accent-pink font-pixel-body"
                        >
                          🔄 重置
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-pixel-gray text-center py-4">暂无分模型配额设置</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="flex-1 px-4 py-2.5 border-4 border-border text-white font-pixel-title hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveQuotaSettings}
                className="flex-1 px-4 py-2.5 btn-primary text-white font-pixel-title"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats Modal - 像素风格 */}
      {showStatsModal && selectedKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-bg-card w-full max-w-2xl p-6 shadow-pixel-xl border-4 border-border max-h-[80vh] overflow-y-auto pixel-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-pixel-title text-white">使用统计</h3>
                <p className="text-sm text-pixel-gray mt-1">{selectedKey.name || selectedKey.key}</p>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="text-pixel-gray hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex space-x-2 mb-6">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => handleStatsDaysChange(days)}
                  className={`px-4 py-2 text-sm font-pixel-title transition-colors ${
                    statsDays === days
                      ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                      : 'bg-bg-secondary text-pixel-gray border-4 border-border hover:text-white'
                  }`}
                >
                  最近 {days} 天
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-pixel-title text-white mb-3">使用趋势</h4>
              {usageStats.stats && usageStats.stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bg-secondary border-b-4 border-border">
                      <tr>
                        <th className="px-4 py-2 text-pixel-gray font-pixel-title">日期</th>
                        <th className="px-4 py-2 text-pixel-gray font-pixel-title">总请求</th>
                        <th className="px-4 py-2 text-pixel-accent-green font-pixel-title">成功</th>
                        <th className="px-4 py-2 text-pixel-accent-pink font-pixel-title">失败</th>
                        <th className="px-4 py-2 text-pixel-accent-orange font-pixel-title">限流</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-border">
                      {usageStats.stats.map((stat, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-white font-pixel-body">{stat.date}</td>
                          <td className="px-4 py-3 text-white font-pixel-body">{stat.requests}</td>
                          <td className="px-4 py-3 text-pixel-accent-green font-pixel-body">{stat.success || 0}</td>
                          <td className="px-4 py-3 text-pixel-accent-pink font-pixel-body">{stat.errors || 0}</td>
                          <td className="px-4 py-3 text-pixel-accent-orange font-pixel-body">{stat.rate_limited || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-pixel-gray text-center py-8">暂无使用数据</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full px-4 py-2.5 bg-bg-secondary text-white font-pixel-title border-4 border-border hover:bg-bg-input transition-colors"
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
