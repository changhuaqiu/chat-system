# 6. API 接口规范

## 6.1 基础信息

**Base URL**: `http://localhost:3001`
**协议**: HTTP + WebSocket
**响应格式**: JSON

## 6.2 通用响应格式

```typescript
// 成功响应
{
  success: true,
  data: any,
  message?: string
}

// 错误响应
{
  success: false,
  error: string
}
```

## 6.3 API 端点列表

### 6.3.1 Bot 管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/bots | 获取所有 Bot |
| GET | /api/bots/:id | 获取单个 Bot |
| POST | /api/bots | 创建 Bot |
| PUT | /api/bots/:id | 更新 Bot |
| DELETE | /api/bots/:id | 删除 Bot |
| POST | /api/bots/test | 测试连接 |

**GET /api/bots**
```json
// Response
{
  "success": true,
  "bots": [
    {
      "id": "bot-abc123",
      "name": "助手",
      "avatar": "🤖",
      "provider_type": "openai",
      "config": "{\"model\":\"gpt-4\",\"apiKey\":\"sk-xxx\"}",
      "status": "online"
    }
  ]
}
```

**POST /api/bots**
```json
// Request
{
  "id": "bot-abc123",
  "name": "助手",
  "avatar": "🤖",
  "provider_type": "openai",
  "config": {
    "model": "gpt-4",
    "apiKey": "sk-xxx",
    "baseUrl": "https://api.openai.com/v1"
  }
}

// Response
{
  "success": true,
  "action": "created",
  "id": "bot-abc123"
}
```

### 6.3.2 One-API 集成

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/bots/oneapi/check | 检查 One-API 状态 |
| GET | /api/bots/oneapi/channels | 获取渠道列表 |
| GET | /api/bots/oneapi/channels/:id/models | 获取渠道模型 |
| POST | /api/bots/oneapi/create-token | 从渠道创建 Token |
| GET | /api/bots/:id/oneapi-status | 获取 Bot 的 One-API 状态 |

**GET /api/bots/oneapi/check**
```json
// Response
{
  "success": true,
  "healthy": true,
  "isConfigured": true,
  "baseUrl": "http://localhost:3002"
}
```

### 6.3.3 Agent 管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /agents | 获取所有 Agent |
| GET | /agents/:agentId | 获取单个 Agent |
| POST | /agents/:agentId/message | 发送消息给 Agent |
| POST | /agents/broadcast | 广播消息 |
| GET | /agents/heartbeat | 心跳检查 |

### 6.3.4 房间管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/rooms | 获取所有房间 |
| GET | /api/rooms/:id | 获取单个房间 |
| POST | /api/rooms | 创建房间 |
| DELETE | /api/rooms/:id | 删除房间 |
| GET | /api/rooms/:id/messages | 获取房间消息 |

**GET /api/rooms/:id/messages**
```
Query: limit=50, offset=0
```
```json
// Response
{
  "messages": [
    {
      "id": "1234567890",
      "room_id": "general",
      "sender": "user",
      "content": "你好",
      "message_type": "text",
      "timestamp": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

### 6.3.5 消息管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/chat/send | 发送消息 |
| POST | /api/messages/:id/react | 添加反应 |

**POST /api/chat/send**
```json
// Request
{
  "roomId": "general",
  "sender": "user",
  "content": "你好 @bot-abc123",
  "mentions": ["bot-abc123"],
  "messageType": "text"
}
```

### 6.3.6 API Key 管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/api-keys | 获取所有 Key |
| POST | /api/api-keys | 创建 Key |
| DELETE | /api/api-keys/:key | 删除 Key |
| GET | /api/api-keys/:key/quota | 获取配额 |
| PUT | /api/api-keys/:key/quota | 设置配额 |

### 6.3.7 统计与日志

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/stats | 获取统计数据 |
| GET | /api/logs | 获取日志 |

### 6.3.8 角色卡

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/character-cards/:botId | 获取角色卡 |
| POST | /api/character-cards/:botId | 保存角色卡 |
| GET | /api/character-cards/templates/list | 获取模板列表 |
| GET | /api/character-cards/templates/:name | 获取模板 |

### 6.3.9 World Info

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/world-info/room/:roomId | 获取房间 World Info |
| POST | /api/world-info | 创建条目 |
| PUT | /api/world-info/:id | 更新条目 |
| DELETE | /api/world-info/:id | 删除条目 |

### 6.3.10 其他

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | / | 服务信息 |
| GET | /health | 健康检查 |
| GET | /api/emoji | 获取表情列表 |
| POST | /api/emoji/upload | 上传图片 |
| GET | /api/emoji/images | 获取已上传图片 |

## 6.4 WebSocket 事件

### 6.4.1 客户端发送

| 事件 | 参数 | 描述 |
|------|------|------|
| joinRoom | `{ room: string }` | 加入房间 |
| sendMessage | `{ room, sender, content, mentions, messageType, mediaUrl, replyToId, metadata }` | 发送消息 |
| typing | `{ room, user }` | 正在输入 |
| stopTyping | `{ room, user }` | 停止输入 |

### 6.4.2 服务端发送

| 事件 | 参数 | 描述 |
|------|------|------|
| messageReceived | MessageObject | 新消息 |
| typing | `{ user, userName, avatar, color }` | 正在输入 |
| stopTyping | `{ user }` | 停止输入 |
| reactionUpdate | `{ messageId, userId, emoji, action }` | 反应更新 |

## 6.5 URN 命名规范

系统使用 URN (Uniform Resource Name) 标识资源：

```
来源 URN:
  agent:user:{userId}     - 人类用户
  agent:{botId}           - Bot
  agent:{agentId}         - OpenClaw Agent

目标 URN:
  room:{roomId}           - 聊天室
```

**示例**:
```javascript
// 用户发送消息
source: 'agent:user:user-123'
target: 'room:general'

// Bot 回复
source: 'agent:bot-abc123'
target: 'room:general'
```
