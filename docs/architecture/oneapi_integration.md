# One-API 集成技术文档

> **文档版本**: 1.1.2
> **最后更新**: 2026-03-08
> **作者**: OpenClaw Team
> **状态**: ✅ 已实现
> **变更日志**:
> - v1.1.2: 修复阿里 Coding Plan 创建频道问题，添加 Session Cookie 认证支持
> - v1.1.1: 修复 One-API API 响应格式兼容性问题
> - v1.1.0: 新增厂商选择、模型联动、Coding Plan 支持
> - v1.0.1: 修复环境变量加载问题（使用 getter 延迟求值）
> - v1.0.0: 初始版本

---

## 目录

1. [概述](#1-概述)
2. [架构设计](#2-架构设计)
3. [配置说明](#3-配置说明)
4. [数据库设计](#4-数据库设计)
5. [API 接口文档](#5-api-接口文档)
6. [核心服务实现](#6-核心服务实现)
7. [前端实现](#7-前端实现)
8. [使用指南](#8-使用指南)
9. [故障排查](#9-故障排查)

---

## 1. 概述

### 1.1 背景

OpenClaw 多机器人聊天系统需要支持多个 LLM 提供商（OpenAI、阿里云通义千问、DeepSeek、Anthropic Claude 等）。为了统一管理这些 LLM 渠道、实现令牌隔离和用量统计，我们集成了 [One-API](https://github.com/songquanpeng/one-api) 作为 LLM 网关。

### 1.2 部署架构

- **One-API 部署位置**: 阿里云 ECS
- **OpenClaw 部署位置**: 本地 macOS
- **通信方式**: HTTPS REST API

### 1.3 核心功能

| 功能 | 说明 |
|------|------|
| 自动渠道创建 | 创建机器人时自动在 One-API 创建独立渠道 |
| 自动令牌生成 | 为每个机器人生成独立的访问令牌 |
| 模型隔离 | 使用唯一模型名称实现 Bot 间隔离 |
| 资源清理 | 删除机器人时自动清理 One-API 渠道和令牌 |
| 状态同步 | 实时同步 One-API 渠道状态 |

---

## 2. 架构设计

### 2.1 集成架构图

```
┌─────────────────────────────────────────────────────────────────┐
│  OpenClaw Backend (localhost:3001)                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  BotController                                           │    │
│  │  └─ registerBot() → OneApiService.setupBotEnv()          │    │
│  │  └─ deleteBot() → OneApiService.deleteBotChannel()       │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  OneApiService                                           │    │
│  │  ├─ HTTP Client (axios) → One-API REST API               │    │
│  │  ├─ Channel Management (CRUD)                            │    │
│  │  ├─ Token Management (CRUD)                              │    │
│  │  └─ DB Mapping (SQLite: oneapi_channels)                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  LlmAdaptor                                              │    │
│  │  └─ chat() → One-API /v1/chat/completions                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  One-API (Aliyun ECS)                                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │  Channel    │   Token     │    User     │   Model     │     │
│  │  (Bot A)    │  (Bot A)    │  (optional) │  Mapping    │     │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤     │
│  │  Channel    │   Token     │    User     │   Model     │     │
│  │  (Bot B)    │  (Bot B)    │  (optional) │  Mapping    │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│       ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│       │  OpenAI    │ │  Aliyun    │ │  DeepSeek  │            │
│       │  API       │ │  DashScope │ │  API       │            │
│       └────────────┘ └────────────┘ └────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

#### 2.2.1 创建机器人流程

```
1. 用户提交机器人配置（Provider、API Key、Model）
         │
         ▼
2. BotController.registerBot()
         │
         ▼
3. OneApiService.setupBotEnv()
   ├─ 生成唯一模型名称：{model}-{botId}
   ├─ POST /api/channel → 创建渠道
   ├─ POST /api/token → 创建令牌
   └─ INSERT oneapi_channels → 保存映射
         │
         ▼
4. 返回 One-API 配置（baseUrl, apiKey, model）
         │
         ▼
5. 保存 Bot 到数据库（使用 One-API 配置）
```

#### 2.2.2 删除机器人流程

```
1. 用户请求删除机器人
         │
         ▼
2. BotController.deleteBot()
         │
         ▼
3. OneApiService.getChannelMapping(botId)
         │
         ▼
4. OneApiService.deleteBotChannel()
   ├─ DELETE /api/token/{tokenId}
   ├─ DELETE /api/channel/{channelId}
   └─ DELETE FROM oneapi_channels WHERE bot_id = ?
         │
         ▼
5. DELETE FROM bots WHERE id = ?
```

---

## 3. 配置说明

### 3.1 环境变量

在 `/02_Development/backend/.env` 文件中配置：

```bash
# 服务器端口
PORT=3001

# 运行环境
NODE_ENV=development

# One-API 配置（阿里云）
ONE_API_BASE_URL=http://8.145.44.153:3000
ONE_API_ROOT_TOKEN=your-root-token-here

# One-API Session Cookie（用于基于 Cookie 的认证）
# 注意：One-API 使用 session cookie 认证，Bearer token 可能不生效
# Session Cookie 有效期为 30 天，过期后需要重新获取
ONE_API_SESSION_COOKIE=session=MTc3MjkyOTA2M3xEWDhFQVFMX2dBQUJFQUVRQUFCc180QUFCQVp6ZEhKcGJtY01CZ0FFY205c1pRTnBiblFFQXdEX3lBWnpkSEpwYm1jTUNBQUdjM1JoZEhWekEybHVkQVFDQUFJR2MzUnlhVzVuREFRQUFtbGtBMmx1ZEFRQ0FBSUdjM1J5YVc1bkRBb0FDSFZ6WlhKdVlXMWxCbk4wY21sdVp3d0dBQVJ5YjI5MHw-iMCSDp0dy4A3iyxiPpHNxgtlpqc3PnrkiYRDkgYNQg==
```

### 3.2 配置项说明

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `ONE_API_BASE_URL` | 是 | One-API 服务地址 | `http://8.145.44.153:3000` |
| `ONE_API_ROOT_TOKEN` | 是 | One-API Root Token（用于兼容） | `rYmPo22nj0vPZ6bhDb306d7aB0784a098bF1C74eE7B6962c` |
| `ONE_API_SESSION_COOKIE` | 推荐 | One-API Session Cookie（用于认证） | `session=xxx` |

### 3.2.1 获取 Session Cookie

1. 登录 One-API 管理后台：
   ```bash
   curl -X POST http://8.145.44.153:3000/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"username":"root","password":"qiu123456"}' -v
   ```

2. 从响应头中复制 `Set-Cookie: session=xxx` 的值

3. 更新 `.env` 文件中的 `ONE_API_SESSION_COOKIE`

### 3.3 配置文件位置

```
02_Development/
└── backend/
    ├── .env              # 实际配置（不提交到 Git）
    ├── .env.example      # 配置模板（提交到 Git）
    └── src/
        └── services/
            └── OneApiService.js
```

---

## 4. 数据库设计

### 4.1 oneapi_channels 表

存储 Bot 与 One-API 渠道的映射关系。

```sql
CREATE TABLE IF NOT EXISTS oneapi_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT UNIQUE NOT NULL,           -- Bot ID（外键）
  channel_id INTEGER,                     -- One-API 渠道 ID
  channel_name TEXT,                      -- 渠道名称
  token_id INTEGER,                       -- One-API 令牌 ID
  token_key TEXT,                         -- One-API 令牌密钥（用于 Bot 调用）
  provider_type TEXT,                     -- 提供商类型（openai/alibaba/deepseek等）
  model_name TEXT,                        -- 唯一模型名称（{model}-{botId}）
  original_api_key TEXT,                  -- 原始 API Key（加密存储建议）
  status TEXT DEFAULT 'active',           -- 状态：active/inactive/unknown
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);
```

### 4.2 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | INTEGER | 主键 ID |
| `bot_id` | TEXT | Bot ID，与 `bots.id` 关联 |
| `channel_id` | INTEGER | One-API 渠道 ID |
| `channel_name` | TEXT | One-API 渠道名称 |
| `token_id` | INTEGER | One-API 令牌 ID |
| `token_key` | TEXT | One-API 令牌密钥（Bot 运行时使用） |
| `provider_type` | TEXT | 原始提供商类型 |
| `model_name` | TEXT | 唯一模型名称（用于路由隔离） |
| `original_api_key` | TEXT | 用户提供的原始 API Key |
| `status` | TEXT | 渠道状态 |

### 4.3 索引设计

- `bot_id`: UNIQUE 索引，确保一个 Bot 只有一个渠道映射
- 外键索引：`bot_id` 关联 `bots(id)`，级联删除

---

## 5. API 接口文档

### 5.1 机器人管理接口

#### 5.1.1 创建/更新机器人

```
POST /api/bots
```

**请求体**:
```json
{
  "id": "bot-abc123",
  "name": "Qwen Assistant",
  "avatar": "🐱",
  "provider_type": "alibaba",
  "config": {
    "model": "qwen-max",
    "apiKey": "sk-xxxxx",
    "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1"
  }
}
```

**响应**:
```json
{
  "success": true,
  "action": "created",
  "id": "bot-abc123"
}
```

#### 5.1.2 获取机器人列表

```
GET /api/bots
```

**响应**:
```json
{
  "success": true,
  "bots": [
    {
      "id": "bot-abc123",
      "name": "Qwen Assistant",
      "avatar": "🐱",
      "status": "online",
      "model": "qwen-max-bot-abc123",
      "provider_type": "alibaba",
      "config": {
        "model": "qwen-max-bot-abc123",
        "baseUrl": "http://localhost:3002/v1",
        "apiKey": "sk-oneapi-token-xxx",
        "originalProvider": "alibaba",
        "originalModel": "qwen-max"
      }
    }
  ]
}
```

#### 5.1.3 更新机器人

```
PUT /api/bots/:id
```

**请求体**: 同创建接口

**响应**:
```json
{
  "success": true,
  "action": "updated",
  "id": "bot-abc123"
}
```

#### 5.1.4 删除机器人

```
DELETE /api/bots/:id
```

**响应**:
```json
{
  "success": true,
  "deleted": "bot-abc123"
}
```

#### 5.1.5 测试连接

```
POST /api/bots/test
```

**请求体**:
```json
{
  "provider_type": "alibaba",
  "config": {
    "model": "qwen-max",
    "apiKey": "sk-xxxxx",
    "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1"
  }
}
```

**响应**:
```json
{
  "success": true,
  "status": "online"
}
```

### 5.2 One-API 状态接口

#### 5.2.1 检查 One-API 健康状态

```
GET /api/bots/oneapi/check
```

**响应**:
```json
{
  "success": true,
  "healthy": true,
  "isConfigured": true,
  "baseUrl": "https://your-oneapi-domain.com"
}
```

#### 5.2.2 获取 Bot 的 One-API 渠道状态

```
GET /api/bots/:id/oneapi-status
```

**响应**:
```json
{
  "success": true,
  "mapping": {
    "bot_id": "bot-abc123",
    "channel_id": 1,
    "channel_name": "Channel for bot-abc123",
    "token_id": 1,
    "model_name": "qwen-max-bot-abc123",
    "status": "active"
  }
}
```

---

## 6. 核心服务实现

### 6.1 OneApiService

**文件**: `src/services/OneApiService.js`

#### 6.1.1 公共方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `checkHealth()` | 检查 One-API 健康状态 | - | `Promise<boolean>` |
| `isConfigured()` | 检查是否已配置（非 localhost） | - | `boolean` |
| `getBaseUrl()` | 获取 One-API 基础 URL | - | `string` |
| `setupBotEnv(botId, providerType, apiKey, models, upstreamBaseUrl)` | 配置 Bot 的 One-API 环境 | botId, providerType, apiKey, models, upstreamBaseUrl | `{ baseUrl, apiKey, model }` |
| `deleteBotChannel(botId)` | 删除 Bot 的 One-API 渠道 | botId | `{ success: true }` |
| `syncChannelStatus(botId)` | 同步渠道状态 | botId | `Promise<mapping>` |
| `getChannelMapping(botId)` | 获取渠道映射 | botId | `Promise<mapping>` |
| `getAllChannelMappings()` | 获取所有映射 | - | `Promise<mappings[]>` |

#### 6.1.2 关键实现：setupBotEnv

```javascript
async setupBotEnv(botId, providerType, apiKey, models = [], upstreamBaseUrl = '') {
  // 1. 检查是否已存在映射
  const existingMapping = await this.getChannelMapping(botId);
  if (existingMapping && existingMapping.status === 'active') {
    return {
      baseUrl: `${ONE_API_URL}/v1`,
      apiKey: existingMapping.token_key,
      model: existingMapping.model_name
    };
  }

  // 2. 生成唯一模型名称（实现隔离）
  const uniqueModelName = `${models[0] || 'default'}-${botId}`;
  const mapping = {};
  mapping[uniqueModelName] = models[0] || 'default';

  // 3. 创建 One-API 渠道
  const payload = {
    name: `Channel for ${botId}`,
    type: PROVIDER_MAPPING[providerType] || 1,
    key: apiKey,
    models: [uniqueModelName],
    model_mapping: JSON.stringify(mapping),
    groups: ['default']
  };

  if (upstreamBaseUrl) {
    payload.base_url = upstreamBaseUrl;
  }

  const channelRes = await this.client.post('/api/channel', payload);

  // 4. 创建 One-API 令牌
  const tokenRes = await this.client.post('/api/token', {
    name: `Token for ${botId}`,
    remain_quota: -1,
    expired_time: -1
  });

  // 5. 保存到数据库
  await this.saveChannelMapping(botId, {
    channel_id: channelRes.data.data.id,
    channel_name: channelRes.data.data.name,
    token_id: tokenRes.data.data.id,
    token_key: tokenRes.data.data.key,
    provider_type: providerType,
    model_name: uniqueModelName,
    original_api_key: apiKey
  });

  return {
    baseUrl: `${ONE_API_URL}/v1`,
    apiKey: tokenRes.data.data.key,
    model: uniqueModelName
  };
}
```

### 6.2 BotController

**文件**: `src/controllers/botController.js`

#### 6.2.1 registerBot 流程

```javascript
async registerBot(data) {
  const { id, name, provider_type, config } = data;

  // 检查 One-API 是否可用
  const useOneApi = llmProviders.includes(provider_type) &&
                    await oneApiService.checkHealth();

  if (useOneApi) {
    // 通过 One-API 配置渠道
    const oneApiConfig = await oneApiService.setupBotEnv(
      id, provider_type, config.apiKey,
      [config.model], config.baseUrl
    );

    // 使用 One-API 返回的配置
    config = {
      ...config,
      apiKey: oneApiConfig.apiKey,
      baseUrl: oneApiConfig.baseUrl,
      model: oneApiConfig.model,
      originalProvider: provider_type,
      originalModel: config.model
    };
  }

  // 保存到 bots 表
  // ...
}
```

### 6.3 LlmAdaptor

**文件**: `src/adaptors/LlmAdaptor.js`

LlmAdaptor 使用 One-API 返回的配置调用 LLM：

```javascript
async chat(content, context) {
  const response = await axios.post(
    `${this.baseUrl}/chat/completions`,
    {
      model: this.model,  // 唯一模型名称，One-API 自动路由
      messages: context.history || [{ role: 'user', content }]
    },
    {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,  // One-API 令牌
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}
```

---

## 7. 前端实现

### 7.1 页面组件

**文件**: `src/pages/RobotManagePage.jsx`

#### 7.1.1 功能模块

| 模块 | 说明 |
|------|------|
| 统计卡片 | 显示机器人总数、在线、离线数量 |
| One-API 状态栏 | 显示 One-API 连接状态 |
| 筛选栏 | 按状态筛选、搜索机器人 |
| 机器人卡片 | 显示机器人信息、操作按钮 |
| 创建/编辑模态框 | 配置机器人参数 |
| 删除确认模态框 | 二次确认删除操作 |

#### 7.1.2 状态管理

```javascript
const [robots, setRobots] = useState([]);          // 机器人列表
const [oneApiStatus, setOneApiStatus] = useState({ // One-API 状态
  configured: false,
  healthy: false,
  baseUrl: ''
});
const [formData, setFormData] = useState({         // 表单数据
  id: '',
  name: '',
  provider: 'openai',
  model: '',
  apiKey: '',
  baseUrl: ''
});
```

### 7.2 API 服务

**文件**: `src/services/api.js`

```javascript
// 检查 One-API 状态
checkOneApiStatus: async () => {
  const response = await axios.get(`${API_BASE_URL}/api/bots/oneapi/check`);
  return response.data;
},

// 获取机器人 One-API 状态
getBotOneApiStatus: async (botId) => {
  const response = await axios.get(`${API_BASE_URL}/api/bots/${botId}/oneapi-status`);
  return response.data;
},

// 更新机器人
updateBot: async (id, botData) => {
  const response = await axios.put(`${API_BASE_URL}/api/bots/${id}`, botData);
  return response.data;
},
```

### 7.3 添加机器人交互流程（v1.1.0 新增）

**文件**: `src/pages/AdminPage.jsx`

#### 7.3.1 支持的 LLM 厂商

| 厂商 | 标识 | 图标 | 默认 Base URL |
|------|------|------|---------------|
| OpenAI | `openai` | 🤖 | https://api.openai.com/v1 |
| 阿里通义千问 | `alibaba` | 🐱 | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| DeepSeek | `deepseek` | 🐋 | https://api.deepseek.com |
| Anthropic | `anthropic` | 🧠 | https://api.anthropic.com/v1 |
| Google Gemini | `gemini` | ✨ | https://generativelanguage.googleapis.com/v1beta/openai |

#### 7.3.2 阿里云账户类型（Coding Plan 支持）

阿里云通义千问支持两种账户类型，使用不同的 Base URL：

| 账户类型 | 标识 | Base URL | 说明 |
|----------|------|----------|------|
| 普通用户 | `standard` | https://dashscope.aliyuncs.com/compatible-mode/v1 | 适用于 DashScope 普通用户 |
| Coding Plan 用户 | `coding` | https://coding.dashscope.aliyuncs.com/compatible-mode/v1 | 适用于阿里云 Coding Plan 订阅用户 |

#### 7.3.3 交互流程

```
1. 点击「添加 Agent」按钮
         │
         ▼
2. Step 1: 选择 Agent 类型
   ├─ OpenClaw 节点
   ├─ Claude Code
   ├─ 大模型 API  ← 选择此项进入 LLM 配置
   └─ 自定义
         │
         ▼
3. Step 2: 配置信息
   ├─ 输入 Bot ID 和名称
   ├─ 选择模型服务商（卡片选择）
   │   └─ 自动填充默认 Base URL
   ├─ 选择账户类型（仅阿里云，可选）
   │   └─ 切换 Base URL
   ├─ 选择模型（下拉框）
   │   └─ 自动带入选中的模型 ID
   └─ 输入 API Key
         │
         ▼
4. Step 3: 测试连接
   └─ 验证 API Key 有效性
         │
         ▼
5. Step 4: 完成
   └─ 创建机器人并保存到 One-API
```

#### 7.3.4 关键代码

```javascript
// 选择 LLM 厂商
const selectProvider = (providerId) => {
  const provider = PROVIDER_CONFIG[providerId];

  if (provider.variants) {
    // 有变体的厂商（如阿里云）
    const defaultVariant = provider.variants[0];
    setWizardData(prev => ({
      ...prev,
      llm_provider: providerId,
      model: provider.models[0]?.id || '',
      variant: defaultVariant.id,
      config: {
        ...prev.config,
        baseUrl: defaultVariant.baseUrl,
        model: provider.models[0]?.id || ''
      }
    }));
  } else {
    // 无变体的厂商
    setWizardData(prev => ({
      ...prev,
      llm_provider: providerId,
      model: provider.models[0]?.id || '',
      config: {
        ...prev.config,
        baseUrl: provider.baseUrl,
        model: provider.models[0]?.id || ''
      }
    }));
  }
};

// 选择 Variant（阿里云普通/Coding Plan）
const selectVariant = (variantId) => {
  const provider = PROVIDER_CONFIG[wizardData.llm_provider];
  const variant = provider.variants?.find(v => v.id === variantId);

  if (variant) {
    setWizardData(prev => ({
      ...prev,
      variant: variantId,
      config: { ...prev.config, baseUrl: variant.baseUrl }
    }));
  }
};

// 选择模型
const selectModel = (modelId) => {
  setWizardData(prev => ({
    ...prev,
    model: modelId,
    config: { ...prev.config, model: modelId }
  }));
};
```

---

## 8. 使用指南

### 8.1 配置 One-API（阿里云）

1. **获取 One-API 地址和 Token**
   - 登录阿里云 One-API 管理后台
   - 获取部署地址（如：`https://oneapi.example.com`）
   - 获取 Root Token（系统设置 → API 密钥）

2. **配置环境变量**
   ```bash
   cd 02_Development/backend
   cp .env.example .env
   # 编辑 .env 文件
   ONE_API_BASE_URL=https://oneapi.example.com
   ONE_API_ROOT_TOKEN=your-root-token
   ```

3. **重启后端服务**
   ```bash
   npm run dev
   ```

### 8.2 创建机器人

1. 访问机器人管理页面：`http://localhost:5173/admin/robots`
2. 点击「部署新机器人」
3. 填写配置：
   - **机器人名称**: 自定义名称
   - **模型服务商**: 选择提供商（OpenAI/阿里云/DeepSeek）
   - **模型**: 选择具体模型
   - **API 密钥**: 输入提供商的 API Key
4. 点击「测试连接」验证配置
5. 点击「部署机器人」

### 8.3 验证 One-API 集成

1. 创建机器人后，登录 One-API 管理后台
2. 检查是否自动创建了渠道（名称：`Channel for {botId}`）
3. 检查是否自动创建了令牌（名称：`Token for {botId}`）
4. 检查模型映射是否正确（`{model}-{botId}` → `{model}`）

### 8.4 删除机器人

1. 在机器人卡片上点击「删除」
2. 确认删除操作
3. 系统自动清理 One-API 渠道和令牌

---

## 9. 故障排查

### 9.1 One-API 连接失败

**现象**: One-API 状态显示「未配置」或「连接异常」

**排查步骤**:
1. 检查 `.env` 文件配置是否正确
2. 确认 One-API 服务是否运行
3. 检查网络连通性：
   ```bash
   curl -I https://your-oneapi-domain.com
   ```
4. 检查 Root Token 是否正确

### 9.2 环境变量未加载（重要修复）

**问题描述**: 在 v1.0.0 版本中，曾出现环境变量无法正确加载的问题，即使 `.env` 文件配置正确，One-API 仍显示默认值 `http://localhost:3002`。

**根本原因**: ES6 模块提升（hoisting）导致模块级常量在 `dotenv.config()` 执行前就已求值。

**原始代码（有问题）**:
```javascript
// OneApiService.js - ❌ 错误示例
const ONE_API_URL = process.env.ONE_API_BASE_URL || 'http://localhost:3002';
const ROOT_TOKEN = process.env.ONE_API_ROOT_TOKEN || '123456';

class OneApiService {
  constructor() {
    this.client = axios.create({
      baseURL: ONE_API_URL,  // 此时 ONE_API_URL 已求值为默认值
      // ...
    });
  }
}
```

**修复方案**: 使用 getter 方法延迟求值
```javascript
// OneApiService.js - ✅ 正确示例
class OneApiService {
  constructor() {
    this._oneApiUrl = null;
    this._rootToken = null;
    this._client = null;
  }

  get ONE_API_URL() {
    if (this._oneApiUrl === null) {
      this._oneApiUrl = process.env.ONE_API_BASE_URL || 'http://localhost:3002';
    }
    return this._oneApiUrl;
  }

  get ROOT_TOKEN() {
    if (this._rootToken === null) {
      this._rootToken = process.env.ONE_API_ROOT_TOKEN || '123456';
    }
    return this._rootToken;
  }

  get client() {
    if (this._client === null) {
      this._client = axios.create({
        baseURL: this.ONE_API_URL,
        headers: {
          'Authorization': `Bearer ${this.ROOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }
    return this._client;
  }
}
```

### 9.3 创建机器人失败

**现象**: 点击「部署机器人」后报错

**可能原因**:
1. One-API 服务不可达
2. API Key 无效
3. 模型名称不正确

**排查步骤**:
1. 查看后端日志：
   ```bash
   tail -f 02_Development/backend/logs/app.log
   ```
2. 检查 One-API 返回错误：
   ```javascript
   console.error('[OneApiService] Setup failed:', error.response?.data);
   ```

### 9.4 渠道状态同步失败

**现象**: 机器人状态显示异常

**排查步骤**:
1. 手动同步状态：
   ```bash
   curl http://localhost:3001/api/bots/{botId}/oneapi-status
   ```
2. 检查数据库映射：
   ```bash
   sqlite3 chat.db "SELECT * FROM oneapi_channels WHERE bot_id='{botId}';"
   ```

### 9.5 阿里 Coding Plan 创建频道失败

**现象**: 创建阿里 Coding Plan 机器人时报错 `One API Test Failed: Failed to create channel`

**可能原因**:
1. One-API Session Cookie 已过期
2. One-API API 响应格式不匹配

**排查步骤**:
1. 检查 One-API 健康状态：
   ```bash
   curl http://localhost:3001/api/bots/oneapi/check
   ```
2. 如果 `healthy: false`，需要更新 Session Cookie

**解决方案**:

1. **登录 One-API 获取新的 Session Cookie**:
   ```bash
   curl -X POST http://8.145.44.153:3000/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"username":"root","password":"qiu123456"}' -v
   ```

   从响应头中获取 `Set-Cookie: session=xxx`

2. **更新 .env 文件**:
   ```bash
   # 编辑 .env 文件
   ONE_API_SESSION_COOKIE=session=新获取的 session 值
   ```

3. **重启后端服务**:
   ```bash
   pkill -f "node src/server.js"
   node src/server.js &
   ```

4. **验证修复**:
   ```bash
   curl http://localhost:3001/api/bots/oneapi/check
   # 应该返回 {"success":true,"healthy":true,...}
   ```

**注意事项**:
- One-API 的 Session Cookie 有效期为 30 天
- 建议定期检查 One-API 健康状态
- 如果频繁遇到 Cookie 过期问题，建议配置 One-API 的 API Token 认证

### 9.6 One-API API 响应格式说明

不同版本的 One-API 可能返回不同的响应格式：

| 操作 | 成功响应 | 说明 |
|------|----------|------|
| POST /api/channel | `{"success":true,"message":""}` | 不返回 `data` 字段 |
| POST /api/token | `{"success":true,"data":{"id":x,"key":"..."}}` | 返回 `data` 字段 |
| GET /api/channel/ | `{"success":true,"data":[...]}` | 返回频道列表 |
| GET /api/token/ | `{"success":true,"data":[...]}` | 返回令牌列表 |

代码已适配这些响应格式，会自动从列表中获取创建的资源 ID。

---

## 附录

### A. Provider 类型映射表

| Provider | One-API Type ID | 说明 |
|----------|-----------------|------|
| openai | 1 | OpenAI / OpenAI 兼容接口 |
| anthropic | 2 | Anthropic Claude |
| google | 3 | Google Gemini |
| alibaba | 14 | 阿里云通义千问 |
| deepseek | 1 | DeepSeek（OpenAI 兼容） |
| baidu | 13 | 百度文心一言 |
| tencent | 16 | 腾讯混元 |

### B. One-API REST API 参考

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/status` | GET | 健康检查 |
| `/api/channel` | POST | 创建渠道 |
| `/api/channel/:id` | DELETE | 删除渠道 |
| `/api/token` | POST | 创建令牌 |
| `/api/token/:id` | DELETE | 删除令牌 |

### C. 相关文件清单

```
02_Development/
├── backend/
│   ├── .env                         # 环境配置（包含 ONE_API_SESSION_COOKIE）
│   ├── .env.example                 # 配置模板
│   ├── src/
│   │   ├── db.js                    # 数据库初始化（oneapi_channels 表）
│   │   ├── services/
│   │   │   ├── OneApiService.js     # One-API 集成服务 ⭐
│   │   │   ├── botController.js     # 机器人控制器
│   │   │   └── botService.js        # 机器人服务
│   │   ├── adaptors/
│   │   │   └── LlmAdaptor.js        # LLM 适配器
│   │   └── routes/
│   │       └── bots.js              # 机器人路由
│   └── chat.db                      # SQLite 数据库
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AdminPage.jsx        # 管理员页面（支持多厂商选择）⭐
│       │   └── RobotManagePage.jsx  # 机器人管理页面 ⭐
│       └── services/
│           └── api.js               # API 服务
└── docs/
    └── architecture/
        └── oneapi_integration.md    # 本文档
```

---

**文档结束**

如需更新或补充，请联系 OpenClaw 团队。
