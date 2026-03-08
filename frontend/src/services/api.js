import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling']
});

// API 服务
const apiService = {
  // 连接 WebSocket
  connectWebSocket: () => {
    socket.connect();
  },

  // 断开 WebSocket
  disconnectWebSocket: () => {
    socket.disconnect();
  },

  // 加入房间
  joinRoom: (room) => {
    socket.emit('joinRoom', { room });
  },

  // 发送消息
  sendMessage: (room, sender, content, mentions = []) => {
    socket.emit('sendMessage', { room, sender, content, mentions });
  },

  // 获取机器人列表
  getBots: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/bots`);
    return response.data;
  },

  // 创建机器人
  createBot: async (botData) => {
    const response = await axios.post(`${API_BASE_URL}/api/bots`, botData);
    return response.data;
  },

  // 删除机器人
  deleteBot: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/bots/${id}`);
    return response.data;
  },

  // 更新机器人
  updateBot: async (id, botData) => {
    const response = await axios.put(`${API_BASE_URL}/api/bots/${id}`, botData);
    return response.data;
  },

  // 测试机器人连接
  testBotConnection: async (botData) => {
      const response = await axios.post(`${API_BASE_URL}/api/bots/test`, botData);
      return response.data;
  },

  // 检查 One-API 状态
  checkOneApiStatus: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/bots/oneapi/check`);
    return response.data;
  },

  // 获取 One-API 渠道列表
  getOneApiChannels: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/bots/oneapi/channels`);
    return response.data;
  },

  // 获取 One-API 渠道模型列表
  getOneApiChannelModels: async (channelId) => {
    const response = await axios.get(`${API_BASE_URL}/api/bots/oneapi/channels/${channelId}/models`);
    return response.data;
  },

  // 基于 One-API 渠道创建机器人
  createBotFromChannel: async (channelId, channelName, modelName, botName) => {
    const response = await axios.post(`${API_BASE_URL}/api/bots/oneapi/create-token`, {
      channelId,
      channelName,
      modelName,
      botName
    });
    return response.data;
  },

  // 获取机器人 One-API 渠道状态
  getBotOneApiStatus: async (botId) => {
    const response = await axios.get(`${API_BASE_URL}/api/bots/${botId}/oneapi-status`);
    return response.data;
  },

  // 获取 Agent 列表 (OpenClaw)
  getAgents: async () => {
    try {
      // 优先尝试获取 Bots 列表作为 Agents
      const response = await axios.get(`${API_BASE_URL}/api/bots`);
      if (response.data && Array.isArray(response.data.bots)) {
        return { agents: response.data.bots };
      }

      // 降级尝试旧接口
      const legacyResponse = await axios.get(`${API_BASE_URL}/agents`);
      return legacyResponse.data;
    } catch (error) {
      console.error('获取 Agent 列表失败:', error);
      // 网络错误时返回空数组，避免阻塞页面加载
      return { agents: [] };
    }
  },

  // 获取 API Keys
  getApiKeys: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/api-keys`);
    return response.data;
  },

  // 创建 API Key
  createApiKey: async (name, environment = 'production', status = 'active') => {
    const response = await axios.post(`${API_BASE_URL}/api/api-keys`, {
      name,
      environment,
      status
    });
    return response.data;
  },

  // 删除 API Key
  deleteApiKey: async (key) => {
    const response = await axios.delete(`${API_BASE_URL}/api/api-keys/${key}`);
    return response.data;
  },

  // 获取日志
  getLogs: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/logs`);
    return response.data;
  },

  // 获取房间列表
  getRooms: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/rooms`);
    return response.data;
  },

  // 获取房间信息
  getRoom: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/rooms/${id}`);
    return response.data;
  },

  // 创建房间
  createRoom: async (name, description, type, createdBy) => {
    const response = await axios.post(`${API_BASE_URL}/api/rooms`, {
      name,
      description,
      type,
      createdBy
    });
    return response.data;
  },

  // 删除房间
  deleteRoom: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/rooms/${id}`);
    return response.data;
  },

  // 获取房间消息
  getRoomMessages: async (roomId, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/messages?limit=${limit}`);
      return response.data;
    } catch (error) {
      // 404 表示房间不存在，返回空消息列表
      if (error.response?.status === 404) {
        return { messages: [] };
      }
      throw error;
    }
  },

  // 发送消息 (REST API)
  sendChatMessage: async (roomId, sender, content, mentions = [], messageType = 'text', mediaUrl = null, replyToId = null, metadata = {}) => {
    const response = await axios.post(`${API_BASE_URL}/api/chat/send`, {
      roomId,
      sender,
      content,
      mentions,
      messageType,
      mediaUrl,
      replyToId,
      metadata
    });
    return response.data;
  },

  // Toggle Reaction
  toggleReaction: async (messageId, userId, emoji) => {
    const response = await axios.post(`${API_BASE_URL}/api/messages/${messageId}/react`, {
        userId,
        emoji
    });
    return response.data;
  },

  // 获取统计数据
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/stats`);
    return response.data;
  },

  // 获取表情列表
  getEmojis: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/emoji`);
    return response.data;
  },

  // 获取已上传的图片列表
  getUploadedImages: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/emoji/images`);
    return response.data;
  },

  // 上传图片 (base64)
  uploadImage: async (base64Data, filename) => {
    const response = await axios.post(`${API_BASE_URL}/api/emoji/upload`, {
      base64: base64Data,
      filename: filename || 'upload.png'
    });
    return response.data;
  },

  // 获取 API Key 配额
  getApiKeyQuota: async (key) => {
    const response = await axios.get(`${API_BASE_URL}/api/api-keys/${key}/quota`);
    return response.data;
  },

  // 设置 API Key 配额
  setApiKeyQuota: async (key, quotaLimit, rateLimit) => {
    const response = await axios.put(`${API_BASE_URL}/api/api-keys/${key}/quota`, {
      quotaLimit,
      rateLimit
    });
    return response.data;
  },

  // 获取分模型配额
  getModelQuotas: async (key, model) => {
    const params = model ? { model } : {};
    const response = await axios.get(`${API_BASE_URL}/api/api-keys/${key}/model-quota`, { params });
    return response.data;
  },

  // 设置分模型配额
  setModelQuota: async (key, model, requestLimit, rateLimit) => {
    const response = await axios.put(`${API_BASE_URL}/api/api-keys/${key}/model-quota`, {
      model,
      requestLimit,
      rateLimit
    });
    return response.data;
  },

  // 重置配额
  resetQuota: async (key, model) => {
    const response = await axios.post(`${API_BASE_URL}/api/api-keys/${key}/reset`, { model });
    return response.data;
  },

  // 获取使用统计
  getUsageStats: async (key, days = 7) => {
    const response = await axios.get(`${API_BASE_URL}/api/api-keys/${key}/stats`, {
      params: { days }
    });
    return response.data;
  },

  // === Character Cards API ===

  // 获取角色卡
  getCharacterCard: async (botId) => {
    const response = await axios.get(`${API_BASE_URL}/api/character-cards/${botId}`);
    return response.data;
  },

  // 保存角色卡
  saveCharacterCard: async (botId, card) => {
    const response = await axios.post(`${API_BASE_URL}/api/character-cards/${botId}`, card);
    return response.data;
  },

  // 获取角色卡模板列表
  getCharacterCardTemplates: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/character-cards/templates/list`);
    return response.data;
  },

  // 加载角色卡模板
  loadCharacterCardTemplate: async (name) => {
    const response = await axios.get(`${API_BASE_URL}/api/character-cards/templates/${name}`);
    return response.data;
  },

  // 获取角色卡预览
  getCharacterCardPreview: async (botId) => {
    const response = await axios.get(`${API_BASE_URL}/api/character-cards/${botId}/preview`);
    return response.data;
  },

  // === World Info API ===

  // 获取房间的 World Info 条目列表
  getWorldInfoEntries: async (roomId) => {
    const response = await axios.get(`${API_BASE_URL}/api/world-info/room/${roomId}`);
    return response.data;
  },

  // 获取匹配的 World Info 条目
  getMatchedWorldInfo: async (roomId, context) => {
    const response = await axios.get(`${API_BASE_URL}/api/world-info/room/${roomId}/match?context=${encodeURIComponent(context)}`);
    return response.data;
  },

  // 创建 World Info 条目
  createWorldInfo: async (entry) => {
    const response = await axios.post(`${API_BASE_URL}/api/world-info`, entry);
    return response.data;
  },

  // 更新 World Info 条目
  updateWorldInfo: async (id, entry) => {
    const response = await axios.put(`${API_BASE_URL}/api/world-info/${id}`, entry);
    return response.data;
  },

  // 删除 World Info 条目
  deleteWorldInfo: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/world-info/${id}`);
    return response.data;
  },

  // 测试 World Info 匹配
  testWorldInfoMatch: async (roomId, message) => {
    const response = await axios.get(`${API_BASE_URL}/api/world-info/test?roomId=${encodeURIComponent(roomId)}&message=${encodeURIComponent(message)}`);
    return response.data;
  },

  // Socket 事件监听
  on: (event, callback) => {
    socket.on(event, callback);
  },

  // 移除事件监听
  off: (event, callback) => {
    socket.off(event, callback);
  }
};

export { socket };
export { apiService as default };
export { apiService };
