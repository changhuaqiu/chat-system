# 技术方案设计文档 - 业界方案参考

## 架构定位：OpenClaw Channels 能力实现

### 业界参考架构

#### 1. Discord/Slack Bot 架构 (消息网关模式)
```
客户端 → WebSocket Gateway → 消息路由 → Bot 处理器 → API 调用 → 返回结果
```
- **优点**: 实时性强，支持复杂交互
- **参考**: Discord.js, Slack Bolt 框架
- **适用**: 实时聊天场景，@提及触发

#### 2. Microsoft Bot Framework (事件驱动架构)
```
消息事件 → 适配器 → 中间件管道 → 对话管理器 → 技能注册 → 响应
```
- **优点**: 可扩展性强，支持插件化技能
- **参考**: Bot Framework SDK, Composer 工具
- **适用**: 企业级对话机器人，多轮对话

#### 3. Rasa/Botpress (NLU 微服务架构)
```
用户输入 → NLU 服务 → 对话策略 → 动作服务器 → 响应生成
```
- **优点**: AI 能力强，支持自然语言理解
- **参考**: Rasa Open Source, Botpress 社区版
- **适用**: 智能客服，意图识别场景

### 本项目选择方案：混合架构

#### 核心设计：轻量级消息网关 + OpenClaw Agent 集成
```
React 前端 → WebSocket → Fastify 网关 → Agent 路由 → sessions_send → OpenClaw Agent → 响应回调
```

#### 组件职责
1. **前端层** (`frontend/`)
   - 聊天界面展示 (参考 `chat_interface.html`)
   - 实时消息推送 (WebSocket 客户端)
   - Agent 状态监控

2. **网关层** (`backend/src/server.js`)
   - WebSocket 消息接收/分发
   - 基础消息存储 (SQLite)
   - HTTP API 提供管理功能

3. **路由层** (`backend/src/agent-router.js`)
   - @提及解析和 Agent 匹配
   - 消息分发策略 (自由聊天 vs @触发)
   - Agent 状态管理

4. **集成层** (`backend/src/services/agentService.js`)
   - OpenClaw `sessions_send` 调用封装
   - Agent 响应处理
   - 错误重试和超时控制

5. **数据层**
   - 简化数据模型：`agents` 表代替 `bots/api_keys`
   - Agent-聊天室映射关系
   - 消息历史存储

### 关键技术实现

#### 1. OpenClaw Agent 调用方案
```javascript
// 方案1: 直接调用 sessions_send 工具
const { sessions_send } = require('openclaw-sdk');

async function sendToAgent(agentId, message) {
  return await sessions_send({
    agentId: agentId,
    message: JSON.stringify({
      type: 'chat_message',
      content: message.content,
      sender: message.sender,
      room: message.room,
      timestamp: new Date().toISOString()
    })
  });
}

// 方案2: 通过 OpenClaw REST API (如可用)
// POST http://localhost:8000/api/sessions/send
```

#### 2. 消息路由策略
- **自由聊天模式**: 所有在线 Agent 接收消息，第一个响应者回复
- **@提及模式**: 仅被 @ 的 Agent 处理消息
- **广播模式**: 消息发送给所有 Agent (系统通知)

#### 3. 响应处理机制
- **同步响应**: Agent 立即回复，通过 WebSocket 返回
- **异步回调**: Agent 处理时间较长，通过回调 URL 通知
- **超时控制**: 设置 30 秒超时，超时后发送提示消息

#### 4. Agent 状态管理
- **心跳检测**: 定期检查 Agent 是否在线
- **负载均衡**: 根据 Agent 负载分配消息
- **故障转移**: Agent 离线时自动切换到备用 Agent

### 数据模型设计

```sql
-- 替代原来的 bots 表
CREATE TABLE agents (
  id TEXT PRIMARY KEY,           -- OpenClaw Agent ID (如 'main', 'dev')
  name TEXT NOT NULL,            -- 显示名称
  description TEXT,              -- 描述
  status TEXT DEFAULT 'offline', -- online/offline/busy
  capabilities TEXT,             -- JSON 数组，支持的技能
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 替代原来的 api_keys 表
CREATE TABLE agent_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  chat_room_id TEXT NOT NULL,
  alias TEXT,                    -- 在聊天室中的别名
  permission_level TEXT DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### 部署架构

```
[浏览器] → [Vite Dev Server] → [Fastify + WebSocket] → [OpenClaw Gateway] → [多个 Agent]
    ↑           (端口 5174)        (端口 3000)           (端口 8000)        (各自进程)
    └─────────────────────────────────────────────────────────────────────────┘
                          实时消息流 (WebSocket + HTTP)
```

### 性能考量
- **并发支持**: WebSocket 连接池管理
- **消息队列**: 高并发时引入 Redis 消息队列缓冲
- **缓存策略**: Agent 列表和状态缓存，减少 API 调用

### 安全考量
- **输入验证**: 所有消息内容验证和清理
- **权限控制**: Agent 访问权限分级
- **速率限制**: 防止消息洪水攻击

### 监控和日志
- **健康检查**: `/health` 端点监控所有组件状态
- **消息追踪**: 每个消息分配唯一 ID，全链路追踪
- **错误报告**: 结构化错误日志，便于排查

