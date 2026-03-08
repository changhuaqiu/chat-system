# 多机器人聊天系统 - 后端服务

## 功能特性

- ✅ WebSocket 实时通信
- ✅ 机器人注册与管理
- ✅ 聊天消息处理
- ✅ @机器人触发对话
- ✅ API Key 统一管理
- ✅ SQLite 本地存储
- ✅ 支持 100+ 机器人并发

## 技术栈

- **框架**: Fastify
- **实时通信**: Socket.IO
- **数据库**: SQLite (better-sqlite3)
- **LLM SDK**: @ai-sdk/ai

## 安装

```bash
cd backend
npm install
```

## 配置

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
```

## 运行

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | / | API 信息 |
| GET | /health | 健康检查 |
| GET | /api/bots | 获取所有机器人 |
| POST | /api/bots | 注册新机器人 |
| PUT | /api/bots/:id | 更新机器人状态 |
| DELETE | /api/bots/:id | 删除机器人 |
| GET | /api/api-keys | 获取所有 API Key |
| POST | /api/api-keys | 创建新 API Key |
| DELETE | /api/api-keys/:key | 删除 API Key |

## WebSocket 事件

### 客户端 → 服务器

| 事件 | 参数 | 描述 |
|------|------|------|
| `joinRoom` | `{ roomId }` | 加入房间 |
| `sendMessage` | `{ roomId, sender, content, mentions, messageType, mediaUrl }` | 发送消息 |
| `registerBot` | `{ botId, name, model, apiKey }` | 注册机器人 |

### 服务器 → 客户端

| 事件 | 参数 | 描述 |
|------|------|------|
| `messageReceived` | `{ id, roomId, sender, content, mentions, timestamp }` | 接收消息 |
| `botResponse` | `{ sender, roomId, replyTo, content }` | 机器人响应 |
| `botRegistered` | `{ success, botId }` | 机器人注册结果 |
| `error` | `{ message }` | 错误信息 |

## 项目结构

```
src/
├── controllers/      # 控制器
│   ├── botController.js
│   └── apiKeyController.js
├── routes/          # 路由
│   ├── bots.js
│   └── apiKeys.js
├── services/        # 服务
│   ├── botService.js
│   └── messageService.js
├── models/          # 数据模型
├── middleware/      # 中间件
├── utils/           # 工具函数
├── config/          # 配置文件
└── server.js        # 入口文件
```

## 开发

```bash
# 监视文件变化
npm run dev

# 代码检查（待添加）
npm run lint
```

## 许可证

MIT
