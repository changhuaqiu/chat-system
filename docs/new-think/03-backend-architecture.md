# 3. 后端架构

## 3.1 目录结构

```
backend/
├── src/
│   ├── adaptors/              # Bot 适配器
│   │   ├── BotAdaptor.js      # 基类
│   │   ├── LlmAdaptor.js      # LLM 适配器 (OpenAI兼容)
│   │   ├── OpenClawAdaptor.js # OpenClaw 适配器
│   │   ├── WebhookAdaptor.js  # Webhook 适配器
│   │   └── CliAdaptor.js      # CLI 适配器
│   │
│   ├── controllers/           # 控制器
│   │   ├── botController.js   # Bot CRUD
│   │   └── apiKeyController.js# API Key 管理
│   │
│   ├── middleware/            # 中间件
│   │   ├── RateLimiter.js     # 限流器
│   │   └── quotaMiddleware.js # 配额中间件
│   │
│   ├── routes/                # 路由定义
│   │   ├── bots.js            # /api/bots
│   │   ├── agents.js          # /agents
│   │   ├── rooms.js           # /api/rooms
│   │   ├── messages.js        # /api/messages
│   │   ├── apiKeys.js         # /api/api-keys
│   │   ├── logs.js            # /api/logs
│   │   ├── stats.js           # /api/stats
│   │   ├── emoji.js           # /api/emoji
│   │   ├── quota.js           # /api/quota
│   │   ├── character-cards.js # /api/character-cards
│   │   └── world-info.js      # /api/world-info
│   │
│   ├── services/              # 业务服务
│   │   ├── botService.js      # Bot 消息处理服务
│   │   ├── botRuntime.js      # Bot 运行时
│   │   ├── agentService.js    # Agent 状态管理
│   │   ├── OneApiService.js   # One-API 集成
│   │   ├── messageService.js  # 消息服务 (未完整实现)
│   │   ├── eventBus.js        # 事件总线
│   │   ├── loggerService.js   # 日志服务
│   │   ├── emojiService.js    # 表情服务
│   │   ├── QuotaService.js    # 配额服务
│   │   ├── WorldInfoManager.js# World Info 管理
│   │   └── loaders/           # 加载器
│   │       ├── YAMLLoader.js  # YAML 配置加载
│   │       └── JSONLoader.js  # JSON 配置加载
│   │
│   ├── agent-router.js        # Agent 路由器 (CommonJS ⚠️)
│   ├── db.js                  # 数据库初始化
│   └── server.js              # 服务入口
│
├── migrations/                # 数据库迁移
│   ├── 001_agent_migration.js
│   ├── 002_add_provider_support.js
│   ├── 003_add_bot_stats.js
│   ├── 004_add_character_card.js
│   └── 005_add_world_info.js
│
├── bots/config/               # Bot 配置文件
│   └── templates/             # 角色模板
│
├── data/                      # 运行时数据
│   └── emojis/                # 上传的表情
│
├── .env.example               # 环境变量示例
├── package.json
└── ecosystem.config.cjs       # PM2 配置
```

## 3.2 核心服务详解

### 3.2.1 EventBus (事件总线)

**文件**: `src/services/eventBus.js`

```javascript
class EventBus extends EventEmitter {
  // 发布事件
  async publish(type, source, target, payload, metadata = {}) {
    // 1. 持久化到 events 表
    // 2. 触发内存监听器
    // 3. 触发通配符监听器 '*'
  }
}
```

**设计要点**:
- 继承 Node.js EventEmitter
- 事件持久化到数据库
- 支持通配符监听 `eventBus.on('*', handler)`
- 最大监听器数设为 50

### 3.2.2 BotService (Bot 服务)

**文件**: `src/services/botService.js`

**职责**:
1. 监听 `message.created` 事件
2. 判断 Bot 触发条件
3. 调度 Bot 执行队列
4. 发布 Bot 响应事件

**关键逻辑**:
```javascript
// 触发条件判断
if (isHuman) {
  // 人类用户：自由模式或提及模式
} else {
  // Bot 对 Bot：严格提及模式 + 循环检测
  const depth = metadata?.depth || 0;
  if (depth >= MAX_DEPTH) {
    // 阻止无限循环
  }
}

// 并发控制
this.MAX_CONCURRENT = 3; // 最大并发数
```

### 3.2.3 BotRuntime (Bot 运行时)

**文件**: `src/services/botRuntime.js`

**职责**:
1. 管理适配器实例
2. 构建 System Prompt
3. 调用 LLM API

**System Prompt 构建顺序**:
1. Character Card 人设
2. Agent Registry (其他可用 Bot)
3. World Info 注入

### 3.2.4 OneApiService

**文件**: `src/services/OneApiService.js`

**职责**:
1. One-API 渠道管理
2. Token 创建和管理
3. Bot 环境自动配置

**工作流**:
```
创建 Bot → 创建 Channel → 创建 Token → 保存映射 → 返回配置
```

## 3.3 适配器模式

```
                ┌─────────────┐
                │ BotAdaptor  │ (基类)
                │ ─────────── │
                │ initialize()│
                │ chat()      │
                │ checkStatus()│
                └──────┬──────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       │               │               │               │
       ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ LlmAdaptor  │ │OpenClawAdp  │ │WebhookAdp   │ │ CliAdaptor  │
│ (OpenAI兼容)│ │(OpenClaw)   │ │(HTTP回调)   │ │(本地命令)   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**适配器选择逻辑** (botRuntime.js):
```javascript
switch (providerType) {
  case 'llm':
  case 'openai':
  case 'alibaba':
  case 'deepseek':
  case 'anthropic':
  case 'oneapi':
    return new LlmAdaptor(config);
  case 'openclaw':
    return new OpenClawAdaptor(config);
  case 'webhook':
    return new WebhookAdaptor(config);
  case 'cli':
    return new CliAdaptor(config);
}
```

## 3.4 模块系统问题

**问题**: `agent-router.js` 使用 CommonJS，其他文件使用 ES Modules

```javascript
// agent-router.js (CommonJS)
const axios = require('axios');
module.exports = agentRouter;

// 其他文件 (ES Modules)
import axios from 'axios';
export default agentService;
```

**原因**: package.json 配置 `"type": "module"`，但该文件未更新。

**影响**:
- 导入方式不一致
- 无法在其他 ES Module 文件中正常导入

## 3.5 配置管理现状

**当前方式**: 环境变量直接在代码中读取

```javascript
// OneApiService.js
this._oneApiUrl = process.env.ONE_API_BASE_URL || 'http://localhost:3002';
this._rootToken = process.env.ONE_API_ROOT_TOKEN || '123456';

// agent-router.js (硬编码)
const response = await axios.get('http://localhost:8000/api/agents');

// agentService.js (硬编码)
const sessionKey = `agent:${agent.id}:feishu:group:oc_7c67a3a4814e100e92a4eea9a27afd95`;
```

**问题**:
- 配置分散
- 部分硬编码
- 不利于自动化部署
