import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const PROVIDER_CONFIG = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.openai.com/v1' }
    ],
    models: [
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ]
  },
  alibaba: {
    id: 'alibaba',
    label: '阿里通义千问 (Alibaba)',
    icon: '🐱',
    variants: [
      { id: 'standard', label: '普通用户 (Standard)', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      { id: 'coding_plan', label: 'Coding Plan 用户', baseUrl: 'https://coding.dashscope.aliyuncs.com/compatible-mode/v1' }
    ],
    models: [
      { id: 'qwen-max', label: 'Qwen Max' },
      { id: 'qwen-turbo', label: 'Qwen Turbo' },
      { id: 'qwen-plus', label: 'Qwen Plus' },
      { id: 'qwen-long', label: 'Qwen Long' }
    ]
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    icon: '🐋',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.deepseek.com' }
    ],
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder' }
    ]
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    icon: '🧠',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.anthropic.com/v1' }
    ],
    models: [
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ]
  }
};

const RobotManagePage = () => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // One-API Status
  const [oneApiStatus, setOneApiStatus] = useState({
    configured: false,
    healthy: false,
    baseUrl: ''
  });
  const [checkingOneApi, setCheckingOneApi] = useState(false);

  // One-API Channel Selection
  const [oneApiChannels, setOneApiChannels] = useState([]);
  const [useOneApiChannel, setUseOneApiChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelModels, setChannelModels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    provider: 'openai',
    variant: 'default',
    model: 'gpt-4-turbo',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    roomId: ''
  });
  const [testingConnection, setTestingConnection] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    online: 0,
    offline: 0
  });

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Load One-API channels when modal opens and useOneApiChannel is true
  useEffect(() => {
    if ((showCreateModal || showEditModal) && useOneApiChannel && oneApiStatus.configured) {
      loadOneApiChannels();
    }
  }, [showCreateModal, showEditModal, useOneApiChannel, oneApiStatus.configured]);

  // 当 Provider 改变时，重置 Variant, Model 和 BaseURL
  useEffect(() => {
    const providerConfig = PROVIDER_CONFIG[formData.provider];
    if (providerConfig) {
      const defaultVariant = providerConfig.variants[0];
      setFormData(prev => ({
        ...prev,
        variant: defaultVariant.id,
        baseUrl: defaultVariant.baseUrl,
        model: providerConfig.models.length > 0 ? providerConfig.models[0].id : ''
      }));
    }
  }, [formData.provider]);

  // 当 Variant 改变时，更新 BaseURL
  useEffect(() => {
    const providerConfig = PROVIDER_CONFIG[formData.provider];
    const variantConfig = providerConfig?.variants.find(v => v.id === formData.variant);
    if (variantConfig) {
      setFormData(prev => ({
        ...prev,
        baseUrl: variantConfig.baseUrl
      }));
    }
  }, [formData.variant]);

  const checkOneApiHealth = async () => {
    try {
      setCheckingOneApi(true);
      const status = await apiService.checkOneApiStatus();
      setOneApiStatus({
        configured: status.isConfigured,
        healthy: status.healthy,
        baseUrl: status.baseUrl
      });
    } catch (error) {
      console.error('Failed to check One-API status:', error);
      setOneApiStatus({ configured: false, healthy: false, baseUrl: '' });
    } finally {
      setCheckingOneApi(false);
    }
  };

  const loadOneApiChannels = async () => {
    try {
      setLoadingChannels(true);
      const response = await apiService.getOneApiChannels();
      if (response.success && response.channels) {
        setOneApiChannels(response.channels);
      } else if (response.channels) {
        // Direct channels array
        setOneApiChannels(response.channels);
      }
    } catch (error) {
      console.error('Failed to load One-API channels:', error);
      alert('加载 One-API 渠道失败：' + (error.message || '请检查 One-API 服务是否正常运行'));
      setOneApiChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleChannelSelect = async (channelId) => {
    if (!channelId) {
      setSelectedChannel(null);
      setChannelModels([]);
      setFormData(prev => ({ ...prev, model: '' }));
      return;
    }

    setSelectedChannel(channelId);
    try {
      const response = await apiService.getOneApiChannelModels(channelId);
      if (response.success && response.models) {
        setChannelModels(response.models);
        // Set first model as default
        if (response.models.length > 0) {
          setFormData(prev => ({ ...prev, model: response.models[0] }));
        }
      }
    } catch (error) {
      console.error('Failed to load channel models:', error);
      setChannelModels([]);
    }
  };

  const handleCreateBotFromChannel = async () => {
    try {
      if (!formData.name) {
        alert('请输入机器人名称');
        return;
      }
      if (!selectedChannel || !formData.model) {
        alert('请选择渠道和模型');
        return;
      }

      const channel = oneApiChannels.find(c => c.id === selectedChannel);
      const result = await apiService.createBotFromChannel(
        selectedChannel,
        channel?.name || 'Unknown',
        formData.model,
        formData.name
      );

      if (result.success) {
        // Create the bot with the generated token
        const newBotId = result.botId;
        const botPayload = {
          id: newBotId,
          name: formData.name,
          avatar: PROVIDER_CONFIG[formData.provider]?.icon || '🤖',
          provider_type: 'oneapi',
          config: {
            model: formData.model,
            baseUrl: result.baseUrl,
            apiKey: result.apiKey,
          }
        };

        await apiService.createBot(botPayload);
        setShowCreateModal(false);
        setUseOneApiChannel(false);
        fetchData();
        setFormData(prev => ({ ...prev, name: '', apiKey: '', model: '' }));
        setSelectedChannel(null);
        setChannelModels([]);
      } else {
        alert('创建失败：' + result.error);
      }
    } catch (error) {
      console.error('Failed to create bot from channel:', error);
      alert('创建失败：' + error.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await checkOneApiHealth();
      const botsResponse = await apiService.getBots();
      const botsList = botsResponse.bots || [];
      setRobots(botsList);

      setStats({
        total: botsList.length,
        assigned: botsList.length,
        online: botsList.filter(b => b.status === 'online').length,
        offline: botsList.filter(b => b.status === 'offline').length
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey) {
      alert('请先输入 API 密钥');
      return;
    }

    try {
      setTestingConnection(true);
      const result = await apiService.testBotConnection({
        provider_type: formData.provider,
        config: {
          model: formData.model,
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey
        }
      });

      if (result.success) {
        alert('连接测试成功！');
      } else {
        alert('连接测试失败：' + result.error);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      alert('连接测试出错：' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateBot = async () => {
    try {
      if (!formData.name) {
        alert('请输入机器人名称');
        return;
      }
      if (!formData.apiKey) {
        alert('请输入 API 密钥');
        return;
      }

      const newBotId = 'bot-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

      const botPayload = {
        id: newBotId,
        name: formData.name,
        avatar: PROVIDER_CONFIG[formData.provider].icon,
        provider_type: formData.provider,
        config: {
          model: formData.model,
          provider: formData.provider,
          variant: formData.variant,
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey,
        }
      };

      await apiService.createBot(botPayload);
      setShowCreateModal(false);
      fetchData();
      setFormData(prev => ({ ...prev, name: '', apiKey: '' }));
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert('创建失败：' + error.message);
    }
  };

  const handleEditBot = async () => {
    try {
      if (!formData.name) {
        alert('请输入机器人名称');
        return;
      }

      const botPayload = {
        id: formData.id,
        name: formData.name,
        avatar: PROVIDER_CONFIG[formData.provider]?.icon || '🤖',
        provider_type: formData.provider,
        config: {
          model: formData.model,
          provider: formData.provider,
          variant: formData.variant,
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey,
        }
      };

      await apiService.updateBot(formData.id, botPayload);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update bot:', error);
      alert('更新失败：' + error.message);
    }
  };

  const handleDeleteBot = async (botId) => {
    try {
      await apiService.deleteBot(botId);
      setShowDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('删除失败：' + error.message);
    }
  };

  const openEditModal = (robot) => {
    // 检查是否使用 One-API（通过检查 provider_type 是否为 oneapi）
    const isUsingOneApi = robot.provider_type === 'oneapi';

    setFormData({
      id: robot.id,
      name: robot.name,
      provider: robot.provider_type || 'openai',
      variant: robot.config?.variant || 'default',
      model: robot.model || robot.config?.model || '',
      apiKey: robot.config?.apiKey || '',
      baseUrl: robot.config?.baseUrl || 'https://api.openai.com/v1',
      roomId: ''
    });

    // 如果机器人是通过 One-API 创建的，自动切换到 One-API 渠道选择模式
    if (isUsingOneApi && oneApiStatus.configured) {
      setUseOneApiChannel(true);
    } else {
      setUseOneApiChannel(false);
    }

    setShowEditModal(true);
  };

  const openDeleteConfirm = (robot) => {
    setShowDeleteConfirm(robot);
  };

  const getOneApiBadge = () => {
    if (!oneApiStatus.configured) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          One-API: 未配置
        </span>
      );
    }
    if (oneApiStatus.healthy) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
          One-API: 已连接
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        One-API: 连接异常
      </span>
    );
  };

  const filteredRobots = robots.filter(robot => {
    if (filter === 'online' && robot.status !== 'online') return false;
    if (filter === 'offline' && robot.status !== 'offline') return false;
    if (searchQuery && !robot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const RobotCard = ({ robot }) => (
    <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white ${
            robot.status === 'online'
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200'
              : 'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}>
            {robot.avatar || '🤖'}
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f]">{robot.name}</h4>
            <p className="text-xs text-[#86868b] mt-0.5">ID: {robot.id.substring(0, 8)}...</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${robot.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      </div>

      <div className="space-y-3 flex-1">
        <div className="bg-[#f5f5f7] rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#86868b]">模型</span>
            <span className="font-medium text-[#1d1d1f]">{robot.model || robot.config?.model || 'Unknown'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#86868b]">类型</span>
            <span className="font-medium text-[#1d1d1f]">{robot.type || robot.provider_type || 'Assistant'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-[#86868b]">
           <span>最后活跃:</span>
           <span>{robot.lastActive || '从未'}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#f5f5f7] grid grid-cols-2 gap-2">
        <button
          onClick={() => openEditModal(robot)}
          className="px-3 py-2 bg-white border border-[#d2d2d7] rounded-lg text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
        >
          配置
        </button>
        <button
          onClick={() => openDeleteConfirm(robot)}
          className="px-3 py-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 font-apple">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">机器人管理</h1>
          <p className="text-[#86868b] mt-1">配置和监控您的 AI 工作机器人。</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#007aff] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>部署新机器人</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-[#86868b] uppercase">智能体总数</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-[#86868b] uppercase">已部署</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.assigned}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-green-600 uppercase">在线</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.online}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">离线</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.offline}</p>
        </div>
      </div>

      {/* One-API Status Bar */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-[#1d1d1f]">One-API 集成状态:</span>
          {getOneApiBadge()}
        </div>
        <div className="text-xs text-[#86868b]">
          {oneApiStatus.configured ? `地址：${oneApiStatus.baseUrl}` : '请在 .env 文件中配置 ONE_API_BASE_URL 和 ONE_API_ROOT_TOKEN'}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
            }`}
          >
            所有机器人
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'online' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
            }`}
          >
            在线
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'offline' ? 'bg-[#007aff] text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-white'
            }`}
          >
            离线
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="搜索机器人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all w-64"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Robots Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007aff]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRobots.map(robot => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
          {filteredRobots.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-[#d2d2d7]">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-[#1d1d1f]">未找到机器人</h3>
              <p className="text-[#86868b] mt-1 mb-6">
                {searchQuery || filter !== 'all' ? '尝试调整筛选条件' : '部署您的第一个 AI 工作机器人以开始处理任务'}
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#007aff] hover:bg-[#0066cc] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  部署机器人
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEditBotModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setShowCreateModal(false);
            setFormData(prev => ({ ...prev, name: '', apiKey: '', model: '' }));
            setUseOneApiChannel(false);
            setSelectedChannel(null);
            setChannelModels([]);
          }}
          onTest={handleTestConnection}
          onSubmit={handleCreateBot}
          testingConnection={testingConnection}
          oneApiStatus={oneApiStatus}
          // One-API channel selection props
          useOneApiChannel={useOneApiChannel}
          setUseOneApiChannel={setUseOneApiChannel}
          oneApiChannels={oneApiChannels}
          loadingChannels={loadingChannels}
          selectedChannel={selectedChannel}
          handleChannelSelect={handleChannelSelect}
          channelModels={channelModels}
          onSubmitFromChannel={handleCreateBotFromChannel}
          setSelectedChannel={setSelectedChannel}
          setChannelModels={setChannelModels}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <CreateEditBotModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setShowEditModal(false);
            // Reset to manual config mode after closing
            setUseOneApiChannel(false);
            setSelectedChannel(null);
            setChannelModels([]);
          }}
          onTest={handleTestConnection}
          onSubmit={handleEditBot}
          testingConnection={testingConnection}
          oneApiStatus={oneApiStatus}
          // One-API channel selection props (enabled for edit mode)
          useOneApiChannel={useOneApiChannel}
          setUseOneApiChannel={setUseOneApiChannel}
          oneApiChannels={oneApiChannels}
          loadingChannels={loadingChannels}
          selectedChannel={selectedChannel}
          handleChannelSelect={handleChannelSelect}
          channelModels={channelModels}
          onSubmitFromChannel={handleCreateBotFromChannel}
          setSelectedChannel={setSelectedChannel}
          setChannelModels={setChannelModels}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
      )}
    </div>
  );
};

// Extract modal to a separate component
const CreateEditBotModal = ({
  mode,
  formData,
  setFormData,
  onClose,
  onTest,
  onSubmit,
  testingConnection,
  oneApiStatus,
  // One-API channel selection props
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
  // Show One-API mode in both create and edit modes when One-API is configured
  const showOneApiMode = oneApiStatus.configured;

  // Handle submit from One-API channel selection
  const handleChannelSubmit = () => {
    if (isEditMode && useOneApiChannel && selectedChannel) {
      // Edit mode: update the bot with selected channel info
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
      // Create mode: use existing handler
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

          {/* One-API Channel Mode Toggle (Create and Edit modes) */}
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
            // Manual Configuration Mode (original form)
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

              {/* 3. Variant Selection (if multiple) */}
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

export default RobotManagePage;
