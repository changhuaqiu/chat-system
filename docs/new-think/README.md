# Chat-System 架构文档

> 创建时间: 2026-03-08
> 版本: 1.0.0

## 目录

1. [项目概述](./01-overview.md)
2. [系统架构](./02-system-architecture.md)
3. [后端架构](./03-backend-architecture.md)
4. [前端架构](./04-frontend-architecture.md)
5. [数据库设计](./05-database-schema.md)
6. [API 接口规范](./06-api-specification.md)
7. [WebSocket 事件](./07-websocket-events.md)
8. [外部集成](./08-external-integrations.md)
9. [技术债务与问题](./09-technical-debt.md)
10. [优化建议](./10-optimization-plan.md)
11. [多机器人协作分析与建议](./11-multi-agent-collaboration.md)
12. [上下文管理方案](./12-context-management.md)
13. **[角色卡保存失败问题分析](./13-character-card-save-issue.md)** ⭐ 新增

## 快速概览

### 项目定位

Chat-System 是一个多机器人聊天系统，支持：
- 多种 LLM 提供商（OpenAI、通义千问、DeepSeek、Claude 等）
- OpenClaw Agent 集成
- One-API 网关管理
- 实时 WebSocket 通信
- 角色卡系统（Character Cards）
- World Info 动态上下文注入

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TailwindCSS |
| 后端 | Node.js + Fastify + Socket.io |
| 数据库 | SQLite3 |
| 通信 | WebSocket + REST API |
| 外部服务 | One-API, OpenClaw Gateway |

### 项目结构

```
chat-system/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── adaptors/          # Bot 适配器
│   │   ├── controllers/       # 控制器
│   │   ├── middleware/        # 中间件
│   │   ├── routes/            # 路由定义
│   │   ├── services/          # 业务服务
│   │   ├── agent-router.js    # Agent 路由器 (CommonJS)
│   │   ├── db.js              # 数据库初始化
│   │   └── server.js          # 入口文件
│   ├── migrations/            # 数据库迁移
│   ├── bots/config/           # Bot 配置文件
│   └── data/                  # 数据存储
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   └── main.jsx           # 入口文件
│   └── index.html
│
└── docs/                       # 文档
    └── new-think/             # 架构分析文档
```

### 核心流程

```
用户消息 → WebSocket → EventBus → BotService → BotRuntime → LLM API
                ↓                                    ↓
            持久化 DB                           Bot 响应
                ↓                                    ↓
            广播到房间 ← EventBus ← BotService ←────┘
```
