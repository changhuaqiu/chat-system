# 12. 上下文管理方案

## 12.1 问题背景

### 12.1.1 当前系统的上下文处理

```
┌─────────────────────────────────────────────────────────────────┐
│                    当前上下文处理方式                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   每次请求:                                                      │
│                                                                 │
│   System Prompt (静态)                                          │
│   ├── 角色卡 system_prompt                                      │
│   ├── personality                                               │
│   ├── scenario                                                  │
│   └── Agent Registry                                            │
│                                                                 │
│   +                                                             │
│                                                                 │
│   对话历史 (动态)                                                │
│   └── 最近 N 条消息 (简单截断)                                   │
│                                                                 │
│   问题:                                                          │
│   1. 上下文窗口浪费 - 无关消息占用空间                           │
│   2. 重要信息丢失 - 简单截断可能丢失关键上下文                    │
│   3. Bot 之间信息隔离 - 每个 Bot 独立历史，无法共享关键信息       │
│   4. 无记忆机制 - 无法记住用户偏好、历史决策                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.1.2 多 Bot 协作的上下文挑战

```
场景：作战室开发登录功能

时间线:
T1: 用户: "开发用户登录功能"
T2: pm-bot: "我来分解任务，@dev-backend 请实现 API..."
T3: dev-backend: "API 设计如下..."
T4: 用户: "加上验证码功能"
T5: pm-bot: "@dev-backend 请补充验证码..."
T6: dev-backend: "验证码方案..."

问题：
├── dev-backend 在 T5 时：
│   └── 需要知道 T3 的 API 设计，但可能被截断
│
├── 新加入的 Bot：
│   └── 完全不知道之前的讨论内容
│
└── 长期项目：
    └── 几天后的讨论，早期决策已被遗忘
```

---

## 12.2 上下文管理目标

| 目标 | 说明 | 优先级 |
|------|------|--------|
| 高效利用窗口 | 只保留相关信息，避免浪费 | 高 |
| 关键信息保留 | 重要决策、结论不被截断 | 高 |
| 跨 Bot 共享 | 作战室内 Bot 共享关键上下文 | 高 |
| 长期记忆 | 记住用户偏好、历史决策 | 中 |
| 动态更新 | 上下文随对话演进自动更新 | 中 |

---

## 12.3 方案设计

### 12.3.1 分层上下文架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      分层上下文架构                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: 全局记忆 (Global Memory)                              │
│  ────────────────────────────────                               │
│  • 用户偏好                                                      │
│  • 历史项目总结                                                  │
│  • 常用配置                                                      │
│  • 存储: 数据库持久化                                            │
│  • 生命周期: 跨会话                                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Layer 2: 房间上下文 (Room Context)                             │
│  ───────────────────────────────                                │
│  • 项目目标、里程碑                                              │
│  • 已做出的决策                                                  │
│  • 关键结论摘要                                                  │
│  • 存储: rooms.settings.context                                 │
│  • 生命周期: 房间存在期间                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Layer 3: 会话记忆 (Session Memory)                             │
│  ───────────────────────────────                                │
│  • 当前任务状态                                                  │
│  • 待办事项                                                      │
│  • 最近交互摘要                                                  │
│  • 存储: 内存 + 定期持久化                                       │
│  • 生命周期: 单次协作会话                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Layer 4: 对话历史 (Conversation History)                       │
│  ───────────────────────────────────                            │
│  • 原始消息记录                                                  │
│  • 智能压缩/摘要                                                 │
│  • 存储: messages 表                                             │
│  • 生命周期: 消息产生到被摘要                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3.2 最终 System Prompt 构建

```javascript
async buildSystemPrompt(botId, roomId) {
  const parts = [];

  // Layer 1: 角色卡基础 (静态)
  const card = await this.getCharacterCard(botId);
  parts.push(card.system_prompt);
  parts.push(this.buildPersonalityContext(card));

  // Layer 2: 全局记忆 (用户级)
  const globalMemory = await this.getGlobalMemory(botId);
  if (globalMemory) {
    parts.push(`[Memory]\n${globalMemory}`);
  }

  // Layer 3: 房间上下文 (房间级)
  const roomContext = await this.getRoomContext(roomId);
  if (roomContext) {
    parts.push(`[Project Context]\n${roomContext}`);
  }

  // Layer 4: 会话记忆 (当前任务)
  const sessionMemory = await this.getSessionMemory(roomId);
  if (sessionMemory) {
    parts.push(`[Current Task]\n${sessionMemory}`);
  }

  // Layer 5: Agent Registry
  const agentRegistry = await this.getAgentRegistry(botId, roomId);
  parts.push(agentRegistry);

  // Layer 6: 智能对话历史
  const history = await this.getSmartHistory(roomId, botId);
  // history 作为 messages 数组，不放入 system prompt

  return {
    systemPrompt: parts.join('\n\n'),
    messages: history
  };
}
```

---

## 12.4 各层详细设计

### 12.4.1 Layer 1: 全局记忆 (Global Memory)

**目的**: 记住用户的长期偏好和历史交互

**数据结构**:
```sql
-- 新增表: bot_memories
CREATE TABLE bot_memories (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  user_id TEXT,                    -- 用户ID (可选，支持多用户)
  category TEXT,                   -- 分类: preference | history | knowledge
  key TEXT NOT NULL,               -- 键
  value TEXT,                      -- 值 (JSON)
  importance INTEGER DEFAULT 5,    -- 重要性 1-10
  access_count INTEGER DEFAULT 0,  -- 访问次数
  last_accessed TIMESTAMP,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,            -- 过期时间 (可选)
  FOREIGN KEY (bot_id) REFERENCES bots(id)
);

CREATE INDEX idx_bot_memories_bot ON bot_memories(bot_id);
CREATE INDEX idx_bot_memories_category ON bot_memories(category);
```

**示例数据**:
```json
// 用户偏好
{
  "bot_id": "dev-backend",
  "category": "preference",
  "key": "coding_style",
  "value": {
    "language": "TypeScript",
    "framework": "React",
    "style": "functional"
  },
  "importance": 8
}

// 历史项目
{
  "bot_id": "dev-backend",
  "category": "history",
  "key": "project_login_module",
  "value": {
    "summary": "用户登录模块，包含 JWT 认证、验证码",
    "decisions": ["使用 JWT", "验证码用 Redis 存储"],
    "date": "2024-03-01"
  },
  "importance": 6
}
```

**记忆提取机制**:
```javascript
async getGlobalMemory(botId) {
  // 获取高重要性的记忆
  const memories = await db.all(`
    SELECT key, value FROM bot_memories
    WHERE bot_id = ? AND importance >= 5
    ORDER BY importance DESC, access_count DESC
    LIMIT 10
  `, [botId]);

  if (memories.length === 0) return null;

  return memories.map(m => `- ${m.key}: ${m.value}`).join('\n');
}
```

### 12.4.2 Layer 2: 房间上下文 (Room Context)

**目的**: 维护项目级别的关键信息

**数据结构**:
```json
// rooms.settings.context
{
  "collaborationMode": "war_room",
  "goal": "开发用户认证模块",
  "roleAssignments": {...},

  // 房间上下文
  "context": {
    "summary": "用户认证模块开发项目，目标是实现登录、注册、密码找回功能",
    "milestones": [
      {"name": "需求分析", "status": "completed", "date": "2024-03-01"},
      {"name": "API设计", "status": "in_progress", "date": "2024-03-05"}
    ],
    "decisions": [
      {"topic": "认证方案", "decision": "使用 JWT", "by": "architect-bot"},
      {"topic": "验证码存储", "decision": "使用 Redis", "by": "dev-backend"}
    ],
    "keyArtifacts": [
      {"type": "api_doc", "name": "登录API设计", "url": "..."},
      {"type": "schema", "name": "用户表结构", "url": "..."}
    ],
    "openQuestions": [
      "是否需要支持第三方登录？"
    ],
    "lastUpdated": "2024-03-05T10:00:00Z"
  }
}
```

**上下文更新机制**:
```javascript
// 在 Bot 响应后，检测是否有关键信息需要更新
async updateRoomContext(roomId, botResponse) {
  // 方案1: 规则匹配 (简单)
  if (botResponse.includes('决定') || botResponse.includes('方案是')) {
    // 提取决策信息
  }

  // 方案2: LLM 总结 (更智能)
  const summary = await this.llm.summarize(`
    从以下对话中提取关键决策和结论:
    ${botResponse}

    输出 JSON 格式: { decisions: [], conclusions: [] }
  `);

  // 合并到房间上下文
  await this.mergeContext(roomId, summary);
}
```

### 12.4.3 Layer 3: 会话记忆 (Session Memory)

**目的**: 跟踪当前任务状态

**数据结构**:
```javascript
// 内存中维护，定期持久化
class SessionMemory {
  constructor(roomId) {
    this.roomId = roomId;
    this.currentTask = null;
    this.todos = [];
    this.recentSummaries = [];  // 最近的对话摘要
    this.mentionedEntities = {}; // 提及的实体
  }

  // 格式化输出
  toPrompt() {
    const parts = [];

    if (this.currentTask) {
      parts.push(`Current Task: ${this.currentTask.description}`);
      parts.push(`Status: ${this.currentTask.status}`);
    }

    if (this.todos.length > 0) {
      parts.push(`Todo List:\n${this.todos.map(t => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`);
    }

    if (this.recentSummaries.length > 0) {
      parts.push(`Recent Progress:\n${this.recentSummaries.join('\n')}`);
    }

    return parts.join('\n\n');
  }
}
```

**任务跟踪示例**:
```
会话记忆输出:

Current Task: 实现登录 API
Status: in_progress

Todo List:
- [x] 设计 API 接口
- [x] 实现用户验证
- [ ] 添加验证码功能
- [ ] 编写测试用例

Recent Progress:
- pm-bot 分解任务，分配给 dev-backend
- dev-backend 完成了基础 API 设计
- 用户要求添加验证码功能
```

### 12.4.4 Layer 4: 对话历史 (智能处理)

**问题**: 简单截断会丢失重要信息

**方案: 滑动窗口 + 摘要**

```
┌─────────────────────────────────────────────────────────────────┐
│                      智能对话历史处理                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  时间线:                                                        │
│  ────────────────────────────────────────────────────────────  │
│  T1-T50: [已压缩为摘要]                                         │
│          "前期讨论了登录功能的设计，决定使用 JWT..."             │
│                                                                 │
│  T51-T80: [保留关键消息]                                        │
│          用户: "加上验证码"                                      │
│          pm-bot: "@dev-backend 请补充验证码"                    │
│          dev-backend: "验证码方案..."                           │
│                                                                 │
│  T81-T100: [完整保留]                                           │
│          最近 20 条消息原文                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**实现**:
```javascript
async getSmartHistory(roomId, botId) {
  const MAX_TOKENS = 4000;  // 留给历史的 token 预算
  const KEEP_RECENT = 20;   // 保留最近 N 条原文

  // 1. 获取最近消息
  const recentMessages = await this.getRecentMessages(roomId, KEEP_RECENT);

  // 2. 计算剩余 token 预算
  const recentTokens = this.countTokens(recentMessages);
  const remainingTokens = MAX_TOKENS - recentTokens;

  // 3. 如果有预算，获取摘要
  let summary = null;
  if (remainingTokens > 500) {
    summary = await this.getConversationSummary(roomId, remainingTokens);
  }

  // 4. 组装历史
  const history = [];
  if (summary) {
    history.push({
      role: 'system',
      content: `[Previous Conversation Summary]\n${summary}`
    });
  }
  history.push(...recentMessages);

  return history;
}

async getConversationSummary(roomId, maxTokens) {
  // 检查是否有缓存摘要
  const cached = await this.getCachedSummary(roomId);
  if (cached) return cached;

  // 生成新摘要
  const oldMessages = await this.getMessagesBefore(roomId, 20);
  const summary = await this.llm.summarize(`
    Summarize the following conversation, keeping:
    1. Key decisions made
    2. Important conclusions
    3. Pending tasks
    4. Critical context for understanding current state

    Conversation:
    ${oldMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}
  `);

  // 缓存摘要
  await this.cacheSummary(roomId, summary);

  return summary;
}
```

---

## 12.5 Bot 间上下文共享

### 12.5.1 问题场景

```
T1: 用户: "开发登录功能"
T2: dev-backend: "API 设计是 POST /api/login..."
T3: 用户: "@qa-bot 请写测试用例"

问题: qa-bot 在 T3 时不知道 T2 的 API 设计
```

### 12.5.2 共享上下文机制

```
┌─────────────────────────────────────────────────────────────────┐
│                      Bot 间上下文共享                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  方案1: 房间级共享记忆                                          │
│  ─────────────────────────                                      │
│  • 所有 Bot 共享房间上下文 (Layer 2)                             │
│  • 关键结论自动写入房间 context                                  │
│  • 新消息到达时，相关 Bot 能看到之前的决策                        │
│                                                                 │
│  方案2: 显式传递                                                │
│  ─────────────────                                              │
│  • Bot A @ Bot B 时，传递关键上下文                              │
│  • 类似函数调用的参数传递                                        │
│                                                                 │
│  方案3: 黑板模式 (Blackboard)                                    │
│  ─────────────────────────                                      │
│  • 维护一个共享的"黑板"数据结构                                  │
│  • 各 Bot 可以读取和写入                                         │
│  • 适合复杂协作场景                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.5.3 黑板模式详细设计

**数据结构**:
```sql
-- 新增表: room_blackboard
CREATE TABLE room_blackboard (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  section TEXT NOT NULL,           -- 分区: api_design | db_schema | decisions
  key TEXT NOT NULL,               -- 键
  value TEXT,                      -- 值 (JSON)
  created_by TEXT,                 -- 创建者 Bot
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  version INTEGER DEFAULT 1,       -- 版本号
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE UNIQUE INDEX idx_blackboard_room_section_key
  ON room_blackboard(room_id, section, key);
```

**示例数据**:
```json
// API 设计分区
{
  "room_id": "war-room-001",
  "section": "api_design",
  "key": "login_api",
  "value": {
    "method": "POST",
    "path": "/api/login",
    "request": { "username": "string", "password": "string" },
    "response": { "token": "string", "user": "object" }
  },
  "created_by": "dev-backend"
}

// 数据库设计分区
{
  "section": "db_schema",
  "key": "users_table",
  "value": {
    "columns": [
      { "name": "id", "type": "INTEGER PRIMARY KEY" },
      { "name": "username", "type": "TEXT UNIQUE" },
      { "name": "password_hash", "type": "TEXT" }
    ]
  },
  "created_by": "dev-backend"
}
```

**使用方式**:
```javascript
// Bot 写入黑板
async writeToBlackboard(roomId, section, key, value) {
  await db.run(`
    INSERT OR REPLACE INTO room_blackboard
    (id, room_id, section, key, value, created_by, updated_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(
      (SELECT version + 1 FROM room_blackboard WHERE room_id = ? AND section = ? AND key = ?),
      1
    ))
  `, [uuid(), roomId, section, key, JSON.stringify(value), this.botId, now(), roomId, section, key]);
}

// Bot 读取黑板
async readBlackboard(roomId, sections = null) {
  let query = `SELECT section, key, value, created_by FROM room_blackboard WHERE room_id = ?`;
  const params = [roomId];

  if (sections) {
    query += ` AND section IN (${sections.map(() => '?').join(',')})`;
    params.push(...sections);
  }

  return db.all(query, params);
}

// 构建 System Prompt 时注入黑板内容
async buildBlackboardContext(roomId) {
  const entries = await this.readBlackboard(roomId);

  if (entries.length === 0) return null;

  // 按分区组织
  const grouped = {};
  for (const entry of entries) {
    if (!grouped[entry.section]) grouped[entry.section] = [];
    grouped[entry.section].push(entry);
  }

  // 格式化输出
  const parts = [];
  for (const [section, items] of Object.entries(grouped)) {
    parts.push(`[${section}]`);
    for (const item of items) {
      parts.push(`${item.key}: ${item.value}`);
    }
  }

  return parts.join('\n');
}
```

**协作示例**:
```
T1: dev-backend: "登录 API 设计: POST /api/login..."
    → 自动写入黑板: api_design.login_api = {...}

T2: 用户: "@qa-bot 请写测试用例"
    → qa-bot 的 System Prompt 包含:
       [api_design]
       login_api: { method: "POST", path: "/api/login", ... }
    → qa-bot 能看到 API 设计，直接写测试用例
```

---

## 12.6 记忆更新策略

### 12.6.1 记忆写入时机

```
┌─────────────────────────────────────────────────────────────────┐
│                      记忆写入触发条件                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  全局记忆 (Layer 1):                                            │
│  ─────────────────────                                          │
│  • 用户明确说"记住这个"                                          │
│  • 检测到用户偏好模式 (如"我习惯用 TypeScript")                  │
│  • 完成重要项目后自动总结                                        │
│                                                                 │
│  房间上下文 (Layer 2):                                          │
│  ─────────────────────                                          │
│  • 做出重要决策时                                                │
│  • 完成里程碑时                                                  │
│  • 检测到 "决定"、"方案是"、"结论是" 等关键词                    │
│                                                                 │
│  会话记忆 (Layer 3):                                            │
│  ─────────────────────                                          │
│  • 任务状态变化时                                                │
│  • 新增待办事项时                                                │
│  • 对话段落结束时 (每 N 轮对话)                                  │
│                                                                 │
│  对话摘要 (Layer 4):                                            │
│  ─────────────────────                                          │
│  • 消息数超过阈值时                                              │
│  • Token 数超过预算时                                           │
│  • 对话话题转换时                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.6.2 记忆更新实现

```javascript
class MemoryManager {
  // 检测是否需要更新记忆
  async processMessage(message, response, roomId, botId) {
    // 1. 检测决策
    const decision = this.extractDecision(response);
    if (decision) {
      await this.updateRoomContext(roomId, 'decisions', decision);
    }

    // 2. 检测用户偏好
    const preference = this.extractPreference(message);
    if (preference) {
      await this.updateGlobalMemory(botId, 'preference', preference);
    }

    // 3. 更新会话记忆
    await this.updateSessionMemory(roomId, message, response);

    // 4. 检查是否需要摘要
    const messageCount = await this.getMessageCount(roomId);
    if (messageCount % 50 === 0) {
      await this.generateSummary(roomId);
    }
  }

  // 提取决策 (规则匹配)
  extractDecision(text) {
    const patterns = [
      /决定[使用采]?(\w+)/,
      /方案是[：:]?\s*(.+)/,
      /我们[选择确定]了?\s*(.+)/,
      /最终[方案决定][是：:]\s*(.+)/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { topic: this.inferTopic(text), decision: match[1] || match[0] };
      }
    }
    return null;
  }

  // 提取用户偏好
  extractPreference(text) {
    const patterns = [
      /我[习惯喜欢通常]用\s*(\w+)/,
      /请?记住[我这点]?\s*(.+)/,
      /以后[请要]?\s*(.+)/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { key: this.inferPreferenceKey(text), value: match[1] };
      }
    }
    return null;
  }
}
```

---

## 12.7 数据库变更汇总

### 12.7.1 新增表

```sql
-- 1. 全局记忆表
CREATE TABLE bot_memories (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  user_id TEXT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  importance INTEGER DEFAULT 5,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bots(id)
);

-- 2. 房间黑板表
CREATE TABLE room_blackboard (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 3. 对话摘要缓存表
CREATE TABLE conversation_summaries (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  from_message_id TEXT,
  to_message_id TEXT,
  summary TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 4. 会话记忆表 (持久化)
CREATE TABLE session_memories (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  current_task TEXT,
  todos TEXT,
  entities TEXT,
  updated_at TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

### 12.7.2 索引

```sql
CREATE INDEX idx_bot_memories_bot ON bot_memories(bot_id);
CREATE INDEX idx_bot_memories_category ON bot_memories(category);
CREATE INDEX idx_blackboard_room ON room_blackboard(room_id);
CREATE INDEX idx_summaries_room ON conversation_summaries(room_id);
CREATE INDEX idx_session_room ON session_memories(room_id);
```

---

## 12.8 实施建议

### 12.8.1 分阶段实施

```
Phase 1: 基础记忆 (1周)
├── 实现 bot_memories 表
├── 实现全局记忆读写
└── 在 System Prompt 中注入记忆

Phase 2: 房间上下文 (1周)
├── 实现 rooms.settings.context 结构
├── 实现决策检测和自动更新
└── Bot 间共享房间上下文

Phase 3: 智能历史 (1周)
├── 实现对话摘要生成
├── 实现滑动窗口 + 摘要机制
└── 缓存摘要避免重复计算

Phase 4: 黑板模式 (1周)
├── 实现 room_blackboard 表
├── Bot 写入/读取黑板
└── 自动从响应中提取关键信息
```

### 12.8.2 配置项

```javascript
// config/index.js
export const memoryConfig = {
  // 历史消息
  maxHistoryTokens: 4000,
  keepRecentMessages: 20,

  // 摘要
  summaryInterval: 50,  // 每 N 条消息生成摘要
  summaryMaxTokens: 500,

  // 记忆
  maxMemoryEntries: 100,
  memoryImportanceThreshold: 5,

  // 黑板
  blackboardSections: ['api_design', 'db_schema', 'decisions', 'artifacts']
};
```

---

## 12.9 总结

**核心设计**:
1. **分层架构** - 全局记忆 → 房间上下文 → 会话记忆 → 对话历史
2. **智能压缩** - 滑动窗口 + 摘要，保留关键信息
3. **共享机制** - 黑板模式实现 Bot 间上下文共享
4. **自动更新** - 检测决策、偏好，自动更新记忆

**预期效果**:
- 上下文窗口利用率提升 50%+
- 关键信息不再丢失
- Bot 协作更高效（共享上下文）
- 支持长期项目记忆
