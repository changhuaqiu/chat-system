# 架构设计 - OpenClaw 聊天室系统

## 架构概览

```
┌─────────────────────────────────────────────────────┐
│         前端聊天室（React + Socket.io）              │
│  • 消息展示 • @机器人 • 表情包 • 图片上传            │
└─────────────────┬───────────────────────────────────┘
                  │ WebSocket
┌─────────────────▼───────────────────────────────────┐
│       后端服务（Node.js + Fastify）                  │
│  • 消息存储 • 路由分发 • Agent 通信                  │
└─────────────────┬───────────────────────────────────┘
                  │ sessions_send
┌─────────────────▼───────────────────────────────────┐
│         OpenClaw Gateway                            │
│  • 会话管理 • 权限控制 • Agent 调度                  │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  main  │  │  dev   │  │fullstack│  │  ux    │
│ Agent  │  │ Agent  │  │  -dev   │  │design  │
└────────┘  └────────┘  └────────┘  └────────┘
```

## 核心流程

### 1. 用户发送消息
```
用户输入 "@main 请帮我分析这个股票"
    ↓
前端通过 WebSocket 发送到后端
    ↓
后端识别 @main 提及
    ↓
调用 sessions_send(sessionKey="agent:main:...", message="...")
    ↓
main agent 处理并返回结果
    ↓
后端将结果广播到聊天室
    ↓
前端显示 main agent 的回复
```

### 2. Agent 列表获取
```
前端启动
    ↓
GET /api/agents
    ↓
后端查询 OpenClaw 可用 agent
    ↓
返回 agent 列表（名称、头像、状态）
    ↓
前端显示在侧边栏
```

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Tailwind | 聊天界面 |
| 实时通信 | Socket.io | WebSocket 连接 |
| 后端 | Node.js + Fastify | 轻量级服务 |
| 数据库 | SQLite | 本地存储消息 |
| **Agent 通信** | sessions_send | 调用 OpenClaw agent |
| **Gateway 集成** | OpenClaw API | 与 Gateway 通信 |

## 数据模型

### messages 表
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_type TEXT NOT NULL,  -- 'user' | 'agent'
  sender_id TEXT NOT NULL,     -- user_id 或 agent_id
  sender_name TEXT NOT NULL,   -- 显示名称
  content TEXT NOT NULL,
  mentions TEXT,               -- JSON array of agent_ids
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### rooms 表
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### agent_mappings 表 🆕
```sql
CREATE TABLE agent_mappings (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,  -- OpenClaw agent ID
  display_name TEXT NOT NULL,
  avatar TEXT,
  description TEXT,
  status TEXT DEFAULT 'offline',
  last_active TIMESTAMP
);
```

## API 设计

### 聊天相关
```
GET  /api/rooms              - 获取聊天室列表
POST /api/rooms              - 创建聊天室
GET  /api/rooms/:id/messages - 获取聊天历史
POST /api/chat/send          - 发送消息
POST /api/chat/mention       - @机器人（路由到 agent）
```

### Agent 相关 🆕
```
GET  /api/agents             - 获取 OpenClaw agent 列表
GET  /api/agents/:id/status  - 获取 agent 状态
```

### WebSocket 事件
```
// 客户端 → 服务器
socket.emit('joinRoom', roomId)
socket.emit('sendMessage', { roomId, content, mentions })
socket.emit('typing', { roomId })

// 服务器 → 客户端
socket.emit('messageReceived', message)
socket.emit('agentTyping', { agentId, roomId })
socket.emit('agentResponse', { agentId, content })
```

## 与 OpenClaw 集成

### sessions_send 调用
```javascript
// 后端代码示例
import { sessions_send } from '@openclaw/sdk';

async function routeToAgent(agentId, message) {
  const sessionKey = `agent:${agentId}:feishu:group:${roomId}`;
  
  const response = await sessions_send({
    sessionKey,
    message
  });
  
  return response.reply;
}
```

### Agent 会话映射
```javascript
const agentSessionMap = {
  'main': 'agent:main:feishu:group:oc_xxx',
  'dev': 'agent:dev:feishu:direct:ou_xxx',
  'fullstack-dev': 'agent:fullstack-dev:feishu:direct:ou_xxx',
  // ...
};
```

## 部署架构

```
Mac mini (本地)
├── OpenClaw Gateway (主服务)
│   ├── main agent
│   ├── dev agent
│   ├── fullstack-dev agent
│   └── ...
├── 聊天室后端 (端口 3000)
│   ├── Fastify 服务
│   ├── Socket.io 服务
│   └── SQLite 数据库
└── 聊天室前端 (端口 5173)
    └── React 应用
```

## 安全考虑

1. **权限继承**: 使用 OpenClaw 的权限系统
2. **消息验证**: 验证用户身份
3. **Rate Limiting**: 防止消息洪泛
4. **Agent 访问控制**: 限制可访问的 agent

---
*创建日期: 2026-03-04*
*架构版本: v2.0 (Channels 架构)*
