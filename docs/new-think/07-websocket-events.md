# 7. WebSocket 事件

## 7.1 连接管理

### 初始化连接

```javascript
// frontend/src/services/api.js
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling']
});
```

### 生命周期

```
连接 → connect → joinRoom → 业务事件 → disconnect → 重连
```

## 7.2 客户端事件 (Client → Server)

### 7.2.1 joinRoom

加入聊天室

```javascript
// 发送
socket.emit('joinRoom', { room: 'general' });

// 服务端处理
socket.on('joinRoom', ({ room }) => {
  socket.join(room);
  console.log(`Client ${socket.id} joined room: ${room}`);
});
```

### 7.2.2 sendMessage

发送消息

```javascript
// 发送
socket.emit('sendMessage', {
  room: 'general',
  sender: 'user',
  content: '你好 @bot-abc123',
  mentions: ['bot-abc123'],
  messageType: 'text',
  mediaUrl: null,
  replyToId: null,
  metadata: {}
});
```

**服务端处理流程**:
1. 生成消息 ID 和时间戳
2. 构建事件载荷
3. 发布 `message.created` 事件到 EventBus
4. EventBus 持久化到 `events` 表
5. 触发 `botService.onMessageCreated`
6. Bot 处理完成后发布响应事件
7. 服务端监听器将消息保存到 `messages` 表
8. 通过 `io.to(room).emit('messageReceived', payload)` 广播

### 7.2.3 typing / stopTyping

输入状态

```javascript
// 开始输入
socket.emit('typing', { room: 'general', user: 'user' });

// 停止输入
socket.emit('stopTyping', { room: 'general', user: 'user' });
```

## 7.3 服务端事件 (Server → Client)

### 7.3.1 messageReceived

接收新消息

```javascript
// 监听
socket.on('messageReceived', (message) => {
  // message 结构
  {
    id: '1234567890',
    roomId: 'general',
    sender: 'bot-abc123',
    content: '你好！有什么可以帮你的？',
    mentions: [],
    messageType: 'text',
    mediaUrl: null,
    timestamp: '2026-03-08T10:00:00.000Z',
    replyToId: null,
    metadata: {}
  }
});
```

### 7.3.2 typing / stopTyping

输入状态通知

```javascript
// 监听
socket.on('typing', ({ user, userName, avatar, color }) => {
  // user: 用户/Bot ID
  // userName: 显示名称
  // avatar: 头像
  // color: 颜色类名
});

socket.on('stopTyping', ({ user }) => {
  // user: 用户/Bot ID
});
```

### 7.3.3 reactionUpdate

消息反应更新

```javascript
socket.on('reactionUpdate', ({ messageId, userId, emoji, action }) => {
  // action: 'add' | 'remove'
});
```

## 7.4 EventBus 事件

系统内部使用 EventBus 进行事件驱动通信。

### 7.4.1 message.created

消息创建事件

```javascript
// 发布
eventBus.publish(
  'message.created',    // 事件类型
  'agent:user:user-123', // 来源 URN
  'room:general',       // 目标 URN
  {                     // 载荷
    id: '1234567890',
    roomId: 'general',
    sender: 'user',
    content: '你好',
    mentions: [],
    messageType: 'text',
    mediaUrl: null,
    timestamp: '2026-03-08T10:00:00.000Z',
    replyToId: null,
    metadata: {}
  },
  {                     // 元数据
    reply_to: null,
    depth: 0
  }
);

// 监听
eventBus.on('message.created', async (event) => {
  const { source, target, payload, metadata } = event;
  // 处理逻辑
});
```

### 7.4.2 agent.typing / agent.stopped_typing

Bot 输入状态事件

```javascript
// Bot 开始处理
eventBus.publish('agent.typing', `agent:${bot.id}`, `room:${roomId}`, {
  roomId,
  userId: bot.id,
  userName: bot.name,
  avatar: bot.avatar,
  color: bot.color
});

// Bot 处理完成
eventBus.publish('agent.stopped_typing', `agent:${bot.id}`, `room:${roomId}`, {
  roomId,
  userId: bot.id
});
```

## 7.5 事件流图

```
用户输入
    │
    ▼
socket.emit('sendMessage')
    │
    ▼
server.js: socket.on('sendMessage')
    │
    ▼
eventBus.publish('message.created')
    │
    ├──────────────────────┐
    ▼                      ▼
db.run(INSERT)      botService.onMessageCreated
    │                      │
    │                      ▼
    │              检查触发条件
    │                      │
    │                      ▼
    │              botRuntime.generateResponse
    │                      │
    │                      ▼
    │              LlmAdaptor.chat()
    │                      │
    │                      ▼
    │              eventBus.publish('message.created')
    │                      │
    │                      ▼
    │              db.run(INSERT)
    │                      │
    ├──────────────────────┤
    ▼                      ▼
io.to(room).emit('messageReceived')
    │
    ▼
客户端更新 UI
```

## 7.6 潜在问题

### 7.6.1 缺少心跳机制

**问题**: 依赖 Socket.io 内置心跳，无显式应用层心跳

**影响**:
- 无法检测僵尸连接
- 断线检测延迟

**建议**:
```javascript
// 服务端
io.on('connection', (socket) => {
  // 发送心跳
  const heartbeatInterval = setInterval(() => {
    socket.emit('ping', { timestamp: Date.now() });
  }, 25000);

  socket.on('pong', () => {
    socket.lastPong = Date.now();
  });

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });
});

// 客户端
socket.on('ping', (data) => {
  socket.emit('pong', { timestamp: Date.now() });
});
```

### 7.6.2 断线重连无状态恢复

**问题**: 断线后无法恢复消息历史

**影响**:
- 用户需要手动刷新
- 可能丢失消息

**建议**:
- 客户端维护消息队列
- 重连后请求缺失消息
- 服务端维护消息序号
