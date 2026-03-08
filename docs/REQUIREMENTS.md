# 需求规格说明书 - OpenClaw 聊天室系统

## 项目信息
- **创建时间**: 2026-03-03
- **确认时间**: 2026-03-03 22:56
- **架构调整**: 2026-03-04 23:13
- **负责人**: 邱哥
- **状态**: 需求已更新

## 核心需求变更 🔴

### 架构定位
**OpenClaw 聊天室 = Channels 能力**

```
┌─────────────────────────────────────────┐
│      前端聊天室界面（展示层）             │
│  • 消息展示 • @机器人 • 表情包/图片       │
└─────────────┬───────────────────────────┘
              │ WebSocket / API
┌─────────────▼───────────────────────────┐
│      OpenClaw Gateway（路由层）          │
│  • 消息分发 • 会话管理 • 权限控制         │
└─────────────┬───────────────────────────┘
              │ sessions_send
┌─────────────▼───────────────────────────┐
│      OpenClaw Agents（处理层）           │
│  • main • dev • fullstack-dev            │
│  • ux-design • zhuguan • qa-tester       │
└─────────────────────────────────────────┘
```

### 关键变化
1. **机器人来源**：OpenClaw 现有 agent
   - main（主管）
   - dev（开发）
   - fullstack-dev（全栈开发）
   - ux-design（UX 设计）
   - zhuguan（研发主管）
   - qa-tester（测试）

2. **不再需要**：
   - ❌ 外部 LLM API（OpenAI/Claude/DeepSeek）
   - ❌ 独立的机器人管理系统
   - ❌ API Key 管理（使用 OpenClaw 内部权限）

3. **需要实现**：
   - ✅ 前端聊天室界面
   - ✅ 与 OpenClaw Gateway 集成
   - ✅ 使用 sessions_send 与 agent 通信
   - ✅ 消息路由（@机器人 → 对应 agent）

## 核心功能

### 1. 聊天室功能
- [x] 基础聊天功能
- [x] 表情包发送
- [x] 图片发送
- [x] @提及功能（@main → 触发 main agent）

### 2. 机器人集成
- **机器人列表**: 动态从 OpenClaw 获取可用 agent
- **触发规则**: @机器人名称 → 消息路由到对应 agent
- **响应显示**: agent 回复显示在聊天室

### 3. 管理后台
- [x] 聊天室管理（创建/删除频道）
- [x] Agent 列表查看
- [x] 消息日志查看
- [x] 系统监控

### 4. 部署
- **类型**: Web 应用
- **部署**: Mac mini 本地运行
- **集成**: 连接到 OpenClaw Gateway

## 技术栈调整

| 层级 | 技术选型 | 变化 |
|------|---------|------|
| 前端 | React + Socket.io | 无变化 |
| 后端 | Node.js + Fastify | 简化（移除 LLM 调用） |
| 数据库 | SQLite | 无变化 |
| **LLM SDK** | ~~@ai-sdk/ai~~ | ❌ **移除** |
| **Agent 通信** | sessions_send | ✅ **新增** |
| **Gateway 集成** | OpenClaw API | ✅ **新增** |

## 功能模块调整

### 模块 1: 聊天核心（无变化）
- 消息发送/接收
- 表情包选择器
- 图片上传/预览
- @自动完成（agent 列表）

### 模块 2: Agent 集成 🆕
- 获取 OpenClaw agent 列表
- 消息路由到对应 agent
- 接收 agent 响应
- 显示 agent 状态（在线/离线）

### 模块 3: 管理后台（简化）
- 聊天室管理
- Agent 列表查看
- 消息日志查询
- 系统监控面板

### 模块 4: Gateway 集成 🆕
- 连接 OpenClaw Gateway
- sessions_send 调用
- 会话管理
- 权限验证

## API 设计调整

### 原设计（移除）
```
POST /api/bots - 注册机器人 ❌
POST /api/apikeys - 创建 API Key ❌
```

### 新设计（新增）
```
GET /api/agents - 获取 OpenClaw agent 列表 ✅
POST /api/chat/send - 发送消息到聊天室 ✅
POST /api/chat/mention - @机器人（路由到 agent）✅
GET /api/chat/history - 获取聊天历史 ✅
```

## 数据库调整

### 移除表
- `bots` ❌（使用 OpenClaw agent）
- `api_keys` ❌（使用 OpenClaw 权限）

### 保留表
- `messages` ✅（聊天记录）
- `rooms` ✅（聊天室/频道）

### 新增表
- `agent_mappings` ✅（agent 名称映射）
  - id
  - agent_id（OpenClaw agent ID）
  - display_name（显示名称）
  - avatar（头像）
  - status

## 非功能需求

- **性能**: 支持多用户同时聊天，响应时间 < 2s
- **可用性**: 本地运行，99% 可用性
- **集成**: 无缝连接 OpenClaw Gateway
- **安全**: 继承 OpenClaw 权限系统

---
*创建日期: 2026-03-03*
*最后更新: 2026-03-04 23:15*
*架构变更: 从独立聊天系统 → OpenClaw Channels 能力*
