import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { RobotCard } from './RobotCard';
import { RobotStats } from './RobotStats';
import { RobotFilterBar } from './RobotFilterBar';
import { OneApiStatusBar } from './OneApiStatusBar';
import { CreateEditModal } from './CreateEditModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useBotForm } from './hooks/useBotForm';
import { PROVIDER_CONFIG } from './constants';

const RobotManagePage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useBotForm('openai');

  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const [oneApiStatus, setOneApiStatus] = useState({
    configured: false,
    healthy: false,
    baseUrl: ''
  });
  const [checkingOneApi, setCheckingOneApi] = useState(false);

  const [oneApiChannels, setOneApiChannels] = useState([]);
  const [useOneApiChannel, setUseOneApiChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelModels, setChannelModels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

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

  useEffect(() => {
    if ((showCreateModal || showEditModal) && useOneApiChannel && oneApiStatus.configured) {
      loadOneApiChannels();
    }
  }, [showCreateModal, showEditModal, useOneApiChannel, oneApiStatus.configured]);

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

  const filteredRobots = robots.filter(robot => {
    if (filter === 'online' && robot.status !== 'online') return false;
    if (filter === 'offline' && robot.status !== 'offline') return false;
    if (searchQuery && !robot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleNavigate = (robot) => {
    navigate(`/character-cards/${robot.id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative pixel-scrollbar">
      {/* 像素图案背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pixel-pattern-bg opacity-20"></div>

      <div className="relative z-10">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-pixel-title text-white tracking-tight">机器人管理</h1>
            <p className="text-pixel-gray mt-1 font-pixel-body">配置和监控您的 AI 工作机器人。</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-white px-4 py-2 text-sm font-pixel-title flex items-center space-x-2"
          >
            <span className="text-lg">+</span>
            <span>部署新机器人</span>
          </button>
        </header>

      <RobotStats stats={stats} />
      <OneApiStatusBar oneApiStatus={oneApiStatus} />
      <RobotFilterBar filter={filter} setFilter={setFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Robots Grid - 像素风格 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRobots.map(robot => (
            <RobotCard
              key={robot.id}
              robot={robot}
              onEdit={openEditModal}
              onNavigate={handleNavigate}
              onDelete={openDeleteConfirm}
            />
          ))}
          {filteredRobots.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-16 bg-bg-card border-4 border-dashed border-border">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-pixel-title text-white">未找到机器人</h3>
              <p className="text-pixel-gray mt-1 mb-6 font-pixel-body">
                {searchQuery || filter !== 'all' ? '尝试调整筛选条件' : '部署您的第一个 AI 工作机器人以开始处理任务'}
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-white px-6 py-2.5 text-sm font-pixel-title"
                >
                  部署机器人
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        handleDeleteBot={handleDeleteBot}
        setShowDeleteConfirm={setShowDeleteConfirm}
      />

      {showCreateModal && (
        <CreateEditModal
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

      {showEditModal && (
        <CreateEditModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setShowEditModal(false);
            setUseOneApiChannel(false);
            setSelectedChannel(null);
            setChannelModels([]);
          }}
          onTest={handleTestConnection}
          onSubmit={handleEditBot}
          testingConnection={testingConnection}
          oneApiStatus={oneApiStatus}
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
      </div>
    </div>
  );
};

export default RobotManagePage;
