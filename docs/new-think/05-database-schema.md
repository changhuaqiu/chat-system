# 5. 数据库设计

## 5.1 数据库概述

**类型**: SQLite3
**文件**: `backend/chat.db`
**初始化**: `src/db.js` 的 `initDb()` 函数

## 5.2 表结构

### 5.2.1 bots - Bot 信息表

```sql
CREATE TABLE bots (
  id TEXT PRIMARY KEY,              -- Bot ID
  name TEXT NOT NULL,               -- Bot 名称
  avatar TEXT,                      -- 头像
  provider_type TEXT DEFAULT 'llm', -- 提供商类型
  config TEXT,                      -- 配置 JSON
  status TEXT DEFAULT 'offline',    -- 状态
  last_active TIMESTAMP,            -- 最后活跃时间
  description TEXT,                 -- 描述
  capabilities TEXT,                -- 能力 JSON
  color TEXT,                       -- 显示颜色
  character_card TEXT,              -- 角色卡 JSON
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**provider_type 取值**:
- `llm`: 通用 LLM
- `openai`: OpenAI
- `alibaba`: 阿里通义千问
- `deepseek`: DeepSeek
- `anthropic`: Claude
- `oneapi`: One-API 渠道
- `openclaw`: OpenClaw Agent
- `webhook`: Webhook
- `cli`: CLI 命令

### 5.2.2 messages - 消息表

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,              -- 消息 ID
  room_id TEXT NOT NULL,            -- 房间 ID
  sender TEXT NOT NULL,             -- 发送者
  content TEXT NOT NULL,            -- 消息内容
  mentions TEXT,                    -- @提及 JSON 数组
  message_type TEXT DEFAULT 'text', -- 消息类型
  media_url TEXT,                   -- 媒体 URL
  timestamp TIMESTAMP,              -- 时间戳
  reply_to_id TEXT,                 -- 回复消息 ID
  metadata TEXT,                    -- 元数据 JSON
  is_deleted INTEGER DEFAULT 0,     -- 软删除标记
  updated_at TIMESTAMP
);
```

**message_type 取值**:
- `text`: 文本消息
- `image`: 图片消息
- `file`: 文件消息
- `code`: 代码消息
- `system`: 系统消息

**性能问题**: 缺少索引，大表查询性能差

### 5.2.3 rooms - 聊天室表

```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,              -- 房间 ID
  name TEXT NOT NULL,               -- 房间名称
  description TEXT,                 -- 描述
  type TEXT DEFAULT 'free',         -- 触发类型
  created_by TEXT NOT NULL,         -- 创建者
  created_at TIMESTAMP,
  settings TEXT,                    -- 设置 JSON
  owner_id TEXT                     -- 所有者
);
```

**type 取值** (触发模式):
- `free`: 自由模式 (所有 Bot 自动响应)
- `mention`: 提及模式 (只有被 @ 的 Bot 响应)

**settings JSON 结构** (协作模式配置):

```json
{
  "collaborationMode": "war_room",
  "goal": "开发用户登录功能",
  "roleAssignments": {
    "coordinator": "pm-bot",
    "workers": ["dev-backend", "dev-frontend"],
    "experts": ["architect-bot"],
    "reviewers": ["qa-bot"]
  },
  "workflow": {
    "enableAutoDelegation": true,
    "resultAggregation": "coordinator_summary"
  }
}
```

#### 5.2.3.1 协作模式 (collaborationMode)

| 模式 | 说明 | 特点 |
|------|------|------|
| `war_room` | 作战室 | 有 Leader，任务分解，结果汇总 |
| `chat_room` | 聊天室 | 自由互动，角色扮演，无层级 |
| `panel` | 专家会诊 | 多专家独立响应，投票决策 |
| `standalone` | 独立模式 | 单 Bot 工作，无协作 |

#### 5.2.3.2 角色分配 (roleAssignments)

房间负责分配角色，与 Bot 的角色卡能力匹配：

```json
{
  "coordinator": "pm-bot",           // 协调者 (唯一)
  "workers": ["dev-01", "dev-02"],   // 执行者 (多个)
  "experts": ["architect-01"],       // 专家 (多个)
  "reviewers": ["qa-01"],            // 评审者 (多个)
  "participants": ["bot-01", "bot-02"] // 聊天室参与者
}
```

**验证规则**: 房间分配的角色必须在 Bot 角色卡的 `canWorkAs` 列表中。

#### 5.2.3.3 不同模式的 settings 示例

**作战室 (war_room)**:
```json
{
  "collaborationMode": "war_room",
  "goal": "完成用户认证模块开发",
  "deadline": "2024-03-15",
  "roleAssignments": {
    "coordinator": "pm-bot",
    "workers": ["dev-backend", "dev-frontend"],
    "reviewers": ["qa-bot"]
  },
  "workflow": {
    "enableAutoDelegation": true,
    "resultAggregation": "coordinator_summary"
  }
}
```

**聊天室 (chat_room)**:
```json
{
  "collaborationMode": "chat_room",
  "theme": "技术茶馆",
  "roleAssignments": {
    "participants": ["dev-01", "dev-02", "pm-bot"]
  },
  "interactionRules": {
    "autoRespondKeywords": ["bug", "架构", "代码"],
    "responseProbability": 0.5
  }
}
```

**专家会诊 (panel)**:
```json
{
  "collaborationMode": "panel",
  "topic": "系统架构评审",
  "roleAssignments": {
    "experts": ["architect-01", "security-01", "performance-01"]
  },
  "voting": {
    "enabled": true,
    "consensusRule": "majority",
    "vetoPower": ["security-01"]
  }
}
```

### 5.2.4 events - 事件表

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,              -- 事件 ID (UUID)
  type TEXT,                        -- 事件类型
  source TEXT,                      -- 来源 URN
  target TEXT,                      -- 目标 URN
  payload TEXT,                     -- 载荷 JSON
  metadata TEXT,                    -- 元数据 JSON
  status TEXT,                      -- 状态
  created_at TIMESTAMP
);
```

**用途**: EventBus 持久化所有事件

### 5.2.5 api_keys - API Key 表

```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,         -- API Key
  name TEXT,                        -- 名称
  created_at TIMESTAMP,
  last_used TIMESTAMP,
  environment TEXT,                 -- 环境
  status TEXT,                      -- 状态
  quota_limit INTEGER DEFAULT -1,   -- 配额限制
  quota_used INTEGER DEFAULT 0,     -- 已使用配额
  rate_limit INTEGER DEFAULT 60,    -- 速率限制
  expires_at TIMESTAMP
);
```

### 5.2.6 system_logs - 系统日志表

```sql
CREATE TABLE system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT,                       -- 日志级别
  message TEXT,                     -- 消息
  agent_id TEXT,                    -- Agent ID
  details TEXT,                     -- 详情 JSON
  timestamp TIMESTAMP
);
```

### 5.2.7 oneapi_channels - One-API 渠道映射表

```sql
CREATE TABLE oneapi_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bot_id TEXT UNIQUE NOT NULL,      -- 关联的 Bot ID
  channel_id INTEGER,               -- One-API 渠道 ID
  channel_name TEXT,                -- 渠道名称
  token_id INTEGER,                 -- One-API Token ID
  token_key TEXT,                   -- Token Key
  provider_type TEXT,               -- 提供商类型
  model_name TEXT,                  -- 模型名称
  original_api_key TEXT,            -- 原始 API Key
  status TEXT DEFAULT 'active',     -- 状态
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);
```

### 5.2.8 bot_stats - Bot 统计表

```sql
CREATE TABLE bot_stats (
  bot_id TEXT PRIMARY KEY,
  total_requests INTEGER DEFAULT 0, -- 总请求数
  total_tokens INTEGER DEFAULT 0,   -- 总 Token 数
  last_latency_ms INTEGER DEFAULT 0,-- 最后延迟
  last_active TIMESTAMP
);
```

### 5.2.9 world_info - World Info 表

```sql
CREATE TABLE world_info (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,            -- 房间 ID
  name TEXT NOT NULL,               -- 名称
  keys TEXT,                        -- 触发关键词 JSON 数组
  content TEXT NOT NULL,            -- 注入内容
  priority INTEGER DEFAULT 0,       -- 优先级
  enabled INTEGER DEFAULT 1,        -- 启用状态
  sticky INTEGER DEFAULT 0,         -- 粘性
  "order" INTEGER DEFAULT 0,        -- 排序
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5.2.10 其他表

- `attachments` - 附件表
- `message_reactions` - 消息反应表
- `agent_mappings` - Agent 映射表
- `api_key_model_quotas` - API Key 模型配额表
- `api_key_usage_logs` - API Key 使用日志表

## 5.3 索引现状

**已有索引**:
```sql
-- api_key_model_quotas
CREATE INDEX idx_model_quotas_api_key ON api_key_model_quotas(api_key);
CREATE INDEX idx_model_quotas_model ON api_key_model_quotas(model_name);

-- api_key_usage_logs
CREATE INDEX idx_usage_logs_api_key ON api_key_usage_logs(api_key);
CREATE INDEX idx_usage_logs_created_at ON api_key_usage_logs(created_at);

-- world_info
CREATE INDEX idx_world_info_room ON world_info(room_id);
CREATE INDEX idx_world_info_enabled ON world_info(enabled);
```

**缺失索引** (性能优化建议):
```sql
-- messages 表 (高频查询)
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_room_timestamp ON messages(room_id, timestamp DESC);
```

## 5.4 迁移文件

| 文件 | 描述 |
|------|------|
| 001_agent_migration.js | Agent 迁移 |
| 002_add_provider_support.js | Provider 支持 |
| 003_add_bot_stats.js | Bot 统计 |
| 004_add_character_card.js | 角色卡 |
| 005_add_world_info.js | World Info |

**问题**: 无统一的迁移运行器

## 5.5 数据关系图

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│    bots     │────▶│ oneapi_channels │     │ bot_stats   │
└──────┬──────┘     └─────────────────┘     └─────────────┘
       │
       │
       ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   rooms     │────▶│    messages     │◀────│ world_info  │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────────┐
│   events    │     │ system_logs     │
└─────────────┘     └─────────────────┘
```
