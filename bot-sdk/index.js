/**
 * 多机器人聊天系统 SDK
 * 
 * 功能：
 * 1. 机器人注册与发现
 * 2. 消息处理与响应
 * 3. 机器人之间的 @ 沟通
 */

const WebSocket = require('ws');

class BotSDK {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.bots = new Map();
    this.eventListeners = {};
  }

  // 连接到 WebSocket 服务器
  connect(url = 'ws://localhost:3000') {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      
      this.ws.on('open', () => {
        console.log('Connected to WebSocket server');
        resolve(this.ws);
      });
      
      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });
      
      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data));
      });
    });
  }

  // 注册机器人
  registerBot(botId, name, model, apiKey) {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'registerBot',
          data: { botId, name, model, apiKey }
        }));

        this.ws.once('message', (data) => {
          const response = JSON.parse(data);
          if (response.botRegistered && response.botRegistered.success) {
            resolve(response.botRegistered);
          } else {
            reject(new Error('Failed to register bot'));
          }
        });
      } else {
        reject(new Error('WebSocket not connected'));
      }
    });
  }

  // 加入房间
  joinRoom(roomId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'joinRoom',
        data: { roomId }
      }));
    }
  }

  // 发送消息
  sendMessage(roomId, content, mentions = [], messageType = 'text', mediaUrl = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'sendMessage',
        data: {
          roomId,
          sender: this.config.botId,
          content,
          mentions,
          messageType,
          mediaUrl
        }
      }));
    }
  }

  // 处理消息
  handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'messageReceived':
        this.emit('message', data);
        break;
      case 'botResponse':
        this.emit('botResponse', data);
        break;
      case 'botRegistered':
        this.emit('botRegistered', data);
        break;
      case 'error':
        this.emit('error', data);
        break;
    }
  }

  // 监听事件
  on(event, callback) {
    this.eventListeners = this.eventListeners || {};
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(callback);
  }

  // 触发事件
  emit(event, data) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 导出类
module.exports = BotSDK;
