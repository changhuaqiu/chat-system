# 8. 外部集成

## 8.1 One-API 集成

### 8.1.1 概述

One-API 是一个 LLM API 网关，提供统一的 API 接口和配额管理。

**服务地址**: 由 `ONE_API_BASE_URL` 环境变量配置

**主要功能**:
- 多渠道管理
- API Key 隔离
- 配额控制
- 负载均衡

### 8.1.2 集成架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat-System Backend                     │
│                                                             │
│  ┌─────────────────┐                                        │
│  │  OneApiService  │                                        │
│  │  ─────────────  │                                        │
│  │  setupBotEnv()  │─────────────┐                          │
│  │  getChannels()  │             │                          │
│  │  createToken()  │             │                          │
│  └─────────────────┘             │                          │
│                                  │                          │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ HTTP API
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                         One-API                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Channel    │  │    Token     │  │    Group     │      │
│  │   渠道管理    │  │   令牌管理    │  │   分组管理    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   │ 上游 API
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      LLM Providers                           │
│   OpenAI  │  通义千问  │  DeepSeek  │  Claude  │  其他      │
└─────────────────────────────────────────────────────────────┘
```

### 8.1.3 Bot 创建流程

```javascript
// 用户创建 Bot (从 One-API 渠道)
async createTokenForChannel(channelId, channelName, modelName, botName) {
  // 1. 在 One-API 创建 Token
  const tokenRes = await this.client.post('/api/token', {
    name: `Token-${botId}`,
    remain_quota: -1,  // 无限制
    expired_time: -1   // 永不过期
  });

  // 2. 保存映射关系
  await this.saveChannelMapping(botId, {
    channel_id: channelId,
    token_key: tokenKey,
    model_name: modelName
  });

  // 3. 在 bots 表注册 Bot
  await db.run(
    'INSERT INTO bots (id, name, provider_type, config, status) VALUES (?, ?, ?, ?, ?)',
    [botId, botName, 'oneapi', JSON.stringify({...}), 'online']
  );

  return {
    botId,
    baseUrl: `${this.ONE_API_URL}/v1`,
    apiKey: tokenKey,
    model: modelName
  };
}
```

### 8.1.4 Provider 类型映射

```javascript
const PROVIDER_MAPPING = {
  'openai': 1,
  'anthropic': 2,
  'google': 3,
  'alibaba': 14,
  'deepseek': 1,    // OpenAI 兼容
  'baidu': 13,
  'tencent': 16,
  'oneapi': 1
};
```

### 8.1.5 数据库映射

```sql
-- oneapi_channels 表
CREATE TABLE oneapi_channels (
  bot_id TEXT UNIQUE NOT NULL,
  channel_id INTEGER,
  token_id INTEGER,
  token_key TEXT,
  provider_type TEXT,
  model_name TEXT,
  status TEXT
);
```

## 8.2 OpenClaw Gateway 集成

### 8.2.1 概述

OpenClaw 是一个 Agent 框架，提供多 Agent 协作能力。

**当前状态**: 部分集成，存在硬编码

### 8.2.2 相关文件

| 文件 | 职责 |
|------|------|
| agentService.js | Agent 状态管理 |
| agent-router.js | 消息路由 |
| OpenClawAdaptor.js | API 适配器 |

### 8.2.3 当前问题

**问题 1: 硬编码的 Gateway URL**

```javascript
// agent-router.js:24
const response = await axios.get('http://localhost:8000/api/agents');

// agentService.js:189
const sessionKey = `agent:${agent.id}:feishu:group:oc_7c67a3a4814e100e92a4eea9a27afd95`;
```

**问题 2: sessions_send 未实现**

```javascript
// agentService.js
const sessionsSend = (sessionKey, message) => {
  // TODO: 实际实现应调用 gateway sessions_send
  console.log(`Sending to session ${sessionKey}:`, message);
};
```

**问题 3: 模块系统不兼容**

```javascript
// agent-router.js 使用 CommonJS
const axios = require('axios');
module.exports = agentRouter;

// 无法在 ES Module 中正常导入
```

### 8.2.4 建议的集成架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Chat-System Backend                     │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  GatewayClient  │  │  agentService   │                  │
│  │  ─────────────  │  │  ─────────────  │                  │
│  │  sessionsSend() │◀─│  sendMessage()  │                  │
│  │  getAgents()    │  │  initialize()   │                  │
│  └────────┬────────┘  └─────────────────┘                  │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ HTTP API
            ▼
┌─────────────────────────────────────────────────────────────┐
│                     OpenClaw Gateway                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Agent     │  │   Session    │  │   Message    │      │
│  │    /api/agents│  │ /api/v1/     │  │  /sessions/  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8.3 LLM 提供商集成

### 8.3.1 支持的提供商

| 提供商 | provider_type | Base URL |
|--------|--------------|----------|
| OpenAI | openai | https://api.openai.com/v1 |
| 通义千问 | alibaba | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| DeepSeek | deepseek | https://api.deepseek.com |
| Claude | anthropic | https://api.anthropic.com/v1 |

### 8.3.2 统一接口

所有提供商通过 LlmAdaptor 调用，使用 OpenAI 兼容 API：

```javascript
// LlmAdaptor.js
async chat(content, context) {
  const response = await axios.post(
    `${this.baseUrl}/chat/completions`,
    {
      model: this.model,
      messages: context.history || [{ role: 'user', content }],
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  );
  return response.data.choices[0].message.content;
}
```

## 8.4 环境变量配置

```bash
# .env.example

# One-API 配置
ONE_API_BASE_URL=http://localhost:3002
ONE_API_ROOT_TOKEN=your-root-token

# OpenClaw 配置 (建议添加)
OPENCLAW_GATEWAY_URL=http://localhost:8000
OPENCLAW_SESSION_KEY_TEMPLATE=agent:{agentId}:feishu:group:{groupId}
```
