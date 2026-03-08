# 聊天室角色系统增强计划

**文档编号**: CHARA-SYS-2026-03-08
**设计时间**: 2026-03-08
**设计状态**: 待实现
**优先级**: P0
**灵感来源**: SillyTavern (24K+ ⭐ LLM Frontend)

---

## 目录

1. [核心目标](#核心目标)
2. [架构设计原则](#架构设计原则)
3. [第一阶段：角色卡系统 + World Info](#第一阶段角色卡系统--world-info)
4. [第二阶段：长期记忆 + 上下文压缩](#第二阶段长期记忆--上下文压缩)
5. [第三阶段：Skills 系统 + MCP 集成](#第三阶段 skills 系统--mcp-集成)
6. [实施计划](#实施计划)
7. [验证计划](#验证计划)
8. [配置示例](#配置示例)

---

## 核心目标

解决当前聊天室 AI 回复"太官方"、缺乏个性的问题，通过引入：

1. **角色卡系统** - 让 Agent 有人格化设定
2. **World Info** - 项目上下文自动注入
3. **长期记忆** - 基于 LanceDB Pro 的对话记忆
4. **上下文压缩** - 智能管理 Token 使用

---

## 架构设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                     松耦合 + 可插拔                          │
│  - 每个模块有明确边界和接口                                  │
│  - 可独立开发、测试、替换                                    │
│  - 存储层抽象，支持多种实现                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 第一阶段：角色卡系统 + World Info

### 1.1 角色卡系统 (Character Cards)

#### 数据结构设计

```typescript
// bots 表新增字段：character_card (TEXT)
interface CharacterCard {
  // === 基础身份 ===
  name: string;           // 显示名
  description: string;    // 简短描述 (100 字内)

  // === 性格设定 (SillyTavern 风格) ===
  personality: string;    // 性格描述 (Long Description)
  scenario: string;       // 场景设定 (当前上下文)
  mes_example: string;    // 示例对话 (Few-Shot，用 <START> 分隔)

  // === 外貌/形象 ===
  avatar: string;         // 头像 URL
  first_mes: string;      // 首次见面问候语

  // === 系统指令 ===
  system_prompt: string;  // 定制 System Prompt
  post_history_instructions: string; // 后处理指令

  // === 扩展字段 ===
  creator_notes: string;  // 创作者备注
  tags: string[];         // 标签，用于分类/搜索
  version: string;        // 角色卡版本
  extensions: {           // 扩展数据
    speakingStyle?: {
      tone: 'formal' | 'casual' | 'cute' | 'professional';
      emojiUsage: 'none' | 'sparse' | 'frequent';
      sentenceLength: 'short' | 'medium' | 'long';
    };
    restrictions?: string[];  // 限制
    catchphrases?: string[];  // 口头禅
  };
}
```

#### 角色卡文件格式 (V2)

采用 **YAML Frontmatter + Markdown** 格式，存储于 `bots/config/` 目录：

```yaml
---
spec: chara-card-v2
name: 开发助手
description: 一位经验丰富的全栈开发者
personality: |
  专业、耐心、注重细节。热爱技术分享，喜欢用比喻解释复杂概念。
  偶尔会开一些程序员玩笑，但始终保持专业和友善。
scenario: |
  你正在一个项目聊天室中，这里是开发团队讨论技术和协作的地方。
mes_example: |
  <START>
  用户：这个 bug 怎么修？
  开发助手：让我看看...哦，这是个经典的空指针问题。就像你想打开冰箱拿可乐，
  但冰箱根本不在那儿一样。我们来加个判断...

  <START>
  用户：帮我 review 这段代码
  开发助手：好的，我注意到几个可以改进的地方...
creator_notes: 适合技术问答场景
avatar: /avatars/dev-helper.png
---

# 角色详情

## 技术栈
- 前端：React, TypeScript, TailwindCSS
- 后端：Node.js, Express, SQLite
- 工具：Git, Docker

## 响应风格
- 代码示例优先
- 解释为什么，不只是怎么做
- 提供替代方案
```

#### 模块设计

```
┌────────────────────────────────────────────────────────────┐
│              CharacterCardLoader (接口层)                   │
│  - load(botId): Promise<CharacterCard>                     │
│  - save(botId, card): Promise<void>                        │
│  - import(filePath): Promise<CharacterCard>                │
│  - export(botId, filePath): Promise<void>                  │
│  - listTemplates(): Promise<string[]>                      │
└────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     ┌──────────┐    ┌──────────┐    ┌──────────
     │ JSON     │    │ YAML+MD  │    │ ST       │
     │ Loader   │    │ Loader   │    │ Importer │
     └──────────┘    └──────────┘    └──────────┘
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/services/CharacterCardLoader.js` | 角色卡加载器接口 | 待创建 |
| `backend/src/services/loaders/JSONLoader.js` | JSON 格式实现 | 待创建 |
| `backend/src/services/loaders/YAMLLoader.js` | YAML+MD 格式实现 | 待创建 |
| `backend/src/routes/character-cards.js` | 角色卡 CRUD 路由 | 待创建 |
| `frontend/src/pages/CharacterCardEditor.jsx` | 角色卡编辑 UI | 待创建 |
| `bots/config/*.md` | 角色卡文件存储目录 | 待创建 |

---

### 1.2 World Info (动态上下文注入)

#### 数据结构

```typescript
interface WorldInfoEntry {
  id: string;
  roomId: string;           // 所属房间
  name: string;             // 条目名称
  keys: string[];           // 触发关键词
  content: string;          // 注入内容
  priority: number;         // 优先级 (高的先注入)
  enabled: boolean;         // 是否启用
  sticky: boolean;          // 是否常驻 (始终注入)
  order: number;            // 同优先级内的排序
}
```

#### 模块设计

```
┌────────────────────────────────────────────────────────────┐
│                   WorldInfoManager                          │
│  - getEntries(roomId, context): Promise<WorldInfoEntry[]>  │
│  - injectToPrompt(entries, prompt): string                 │
│  - create(entry): Promise<string>                          │
│  - update(id, entry): Promise<void>                        │
│  - delete(id): Promise<void>                               │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   SQLite      │
                    │ world_info    │
                    └───────────────┘
```

#### 数据库表

```sql
CREATE TABLE IF NOT EXISTS world_info (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  name TEXT NOT NULL,
  keys TEXT,              -- JSON 数组
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  sticky INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 触发机制

**关键词匹配** (第一阶段采用，可控、低成本):

```javascript
function matchWorldInfo(entries, message) {
  const matched = [];
  for (const entry of entries) {
    if (entry.sticky) {
      matched.push(entry);
      continue;
    }
    for (const key of entry.keys) {
      if (message.includes(key)) {
        matched.push(entry);
        break;
      }
    }
  }
  // 按优先级排序
  return matched.sort((a, b) => b.priority - a.priority);
}
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/services/WorldInfoManager.js` | 管理器实现 | 待创建 |
| `backend/src/routes/world-info.js` | API 路由 | 待创建 |
| `frontend/src/components/WorldInfo/WorldInfoManager.jsx` | 管理 UI | 待创建 |

---

## 第二阶段：长期记忆 + 上下文压缩

### 2.1 记忆集成 (LanceDB Pro)

#### 模块设计

```
┌────────────────────────────────────────────────────────────┐
│                      MemoryBridge                           │
│  (连接聊天室与 LanceDB Pro)                                 │
│                                                             │
│  - recall(query, scope, limit): Promise<Memory[]>          │
│  - store(content, metadata): Promise<string>               │
│  - search(query, filters): Promise<Memory[]>               │
│  - delete(id): Promise<void>                               │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  LanceDB Pro  │
                    └───────────────┘
```

#### 记忆注入流程

```javascript
async function sendMessageWithMemory(message, roomId, userId) {
  // 1. 检索相关记忆 (LanceDB)
  const memories = await memoryBridge.recall({
    query: message.content,
    scope: `room:${roomId}`,
    limit: 5
  });

  // 2. 格式化记忆
  const memoryContext = memories.map(m =>
    `[记忆] ${m.content} (记录于：${formatDate(m.timestamp)})`
  ).join('\n');

  // 3. 获取 World Info
  const worldInfoContext = await worldInfoManager.getInjectedContent(roomId, message.content);

  // 4. 获取角色卡
  const characterCard = await characterCardLoader.load(message.agentId);

  // 5. 构建完整 System Prompt
  const systemPrompt = buildSystemPrompt({
    characterCard,
    worldInfo: worldInfoContext,
    memories: memoryContext
  });

  // 6. 发送给 Agent
  return botService.process({
    ...message,
    context: { systemPrompt, memories, worldInfo: worldInfoContext }
  });
}
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/services/MemoryBridge.js` | 记忆桥接器 | 待创建 |
| `backend/src/services/promptBuilder.js` | Prompt 构建器 | 待创建 |

---

### 2.2 上下文压缩 (Context Compression)

#### 设计目标

- 当对话超过 **XXX 个字符** (可配置，默认 8000) 时自动触发压缩
- 保留关键信息，丢失细节
- 支持多种压缩策略

#### 压缩策略

```typescript
interface CompressionStrategy {
  name: string;
  compress(messages: Message[], options: CompressOptions): Promise<Message[]>;
}

// 策略 1: 滑动窗口 (Sliding Window)
class SlidingWindowStrategy {
  compress(messages, { maxMessages = 10 }) {
    return messages.slice(-maxMessages);
  }
}

// 策略 2: 摘要式 (Summarization)
class SummarizationStrategy {
  async compress(messages, { llm, maxTokens = 500 }) {
    // 将早期消息摘要为一段话
    const earlyMessages = messages.slice(0, -5); // 保留最后 5 条
    const summary = await llm.summarize(earlyMessages);
    return [
      { role: 'system', content: `对话摘要：${summary}` },
      ...messages.slice(-5)
    ];
  }
}

// 策略 3: 重要性排序 (Importance-Based，需要嵌入模型)
class ImportanceStrategy {
  async compress(messages, { embedder, maxTokens = 1000 }) {
    const scored = await Promise.all(
      messages.map(async m => ({
        message: m,
        score: await this.scoreImportance(m, embedder)
      }))
    );
    return scored.sort((a, b) => b.score - a.score).slice(0, maxTokens);
  }
}
```

#### ContextManager 设计

```
┌────────────────────────────────────────────────────────────┐
│                    ContextManager                           │
│                                                             │
│  - addMessage(roomId, message): Promise<void>              │
│  - getContext(roomId): Promise<Context>                    │
│  - getCompressedContext(roomId, options): Promise<Context> │
│  - clear(roomId): Promise<void>                            │
│  - getStats(roomId): Promise<ContextStats>                 │
└────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     ┌──────────┐    ┌──────────┐    ┌──────────
     │ Memory   │    │Compressor│    │Strategy  │
     │ Storage  │    │ Manager  │    │ Registry │
     └──────────    └──────────┘    └──────────┘
```

#### 自动压缩触发

```javascript
class ContextManager {
  async addMessage(roomId, message) {
    // 添加到存储
    await this.storage.add(roomId, message);

    // 检查是否需要压缩
    const stats = await this.getStats(roomId);
    if (stats.totalCharacters > this.config.autoCompressThreshold) {
      await this.autoCompress(roomId, stats);
    }
  }

  async autoCompress(roomId, stats) {
    const strategy = this.strategyRegistry.get(this.config.defaultStrategy);
    const messages = await this.storage.get(roomId);
    const compressed = await strategy.compress(messages, this.config.compressOptions);
    await this.storage.replace(roomId, compressed);
  }
}
```

#### 配置结构

```typescript
interface ContextCompressionConfig {
  autoCompressThreshold: number;     // 自动压缩阈值 (字符数)，默认 8000
  targetTokenCount: number;          // 压缩后目标 Token 数，默认 2000
  defaultStrategy: string;           // 默认策略，默认 'sliding-window'
  preserveSystemPrompt: boolean;     // 是否保留 system prompt，默认 true
  preserveLastNMessages: number;     // 至少保留最后 N 条，默认 5
}
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/services/ContextManager.js` | 上下文管理器 | 待创建 |
| `backend/src/services/compression/SlidingWindowStrategy.js` | 滑动窗口策略 | 待创建 |
| `backend/src/services/compression/SummarizationStrategy.js` | 摘要策略 | 待创建 |
| `backend/src/services/compression/ImportanceStrategy.js` | 重要性排序策略 | 待创建 |
| `backend/src/services/StrategyRegistry.js` | 策略注册表 | 待创建 |

---

## 第三阶段：Skills 系统 + MCP 集成

### 3.1 Skills 系统

#### 模块设计

```
┌────────────────────────────────────────────────────────────┐
│                   SkillRegistry                             │
│  - register(skillId, skillImpl): void                       │
│  - get(skillId): Skill                                      │
│  - list(): Skill[]                                          │
│  - unregister(skillId): void                                │
└────────────────────────────────────────────────────────────┘
          │
          │ (注册)
          ▼
┌────────────────────────────────────────────────────────────┐
│                     Skills                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────  ┌──────────┐   │
│  │ Web      │  │ Code     │  │ File     │  │ Webhook  │   │
│  │ Search   │  │ Executor │  │ System   │  │ Caller   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────────────────────────────────────────┘
```

#### Skill 接口

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  triggers: string[];     // 触发关键词
  config: object;         // 配置 schema

  execute(params: object, context: SkillContext): Promise<SkillResult>;
}

interface SkillResult {
  success: boolean;
  data?: any;
  error?: string;
  display?: {
    type: 'text' | 'image' | 'code' | 'file';
    content: string;
  };
}
```

#### 意图检测

```javascript
class IntentDetector {
  // 混合模式：关键词 + LLM
  async detect(message) {
    // 1. 关键词匹配
    const keywordMatch = this.matchByKeywords(message);
    if (keywordMatch.confidence > 0.8) {
      return keywordMatch;
    }

    // 2. LLM 语义匹配
    const llmMatch = await this.matchByLLM(message);
    return llmMatch;
  }
}
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/services/SkillRegistry.js` | 注册表 | 待创建 |
| `backend/src/skills/BaseSkill.js` | 基类 | 待创建 |
| `backend/src/skills/WebSearchSkill.js` | 网络搜索 | 待创建 |
| `backend/src/skills/CodeExecutorSkill.js` | 代码执行 | 待创建 |
| `backend/src/services/IntentDetector.js` | 意图检测 | 待创建 |

---

### 3.2 MCP 集成

#### 设计思路

将 MCP Server 封装为 Skill，通过统一接口调用：

```javascript
class MCPSkill extends BaseSkill {
  constructor(mcpClient, serverId) {
    super();
    this.mcpClient = mcpClient;
    this.serverId = serverId;
  }

  async execute(toolName, params) {
    return await this.mcpClient.callTool(toolName, params);
  }
}
```

#### 关键文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `backend/src/mcp/MCPLoader.js` | MCP 加载器 | 待创建 |
| `backend/src/mcp/MCPSkillWrapper.js` | MCP 技能封装 | 待创建 |

---

## 实施计划

### Phase 1.1: 角色卡系统 (预计 2-3 天)

| 任务 | 描述 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1. 数据库迁移 | `bots` 表新增 `character_card` 字段 | P0 | 0.5h |
| 2. CharacterCardLoader 接口 | 定义接口和抽象类 | P0 | 1h |
| 3. YAMLLoader 实现 | 支持 YAML+MD 格式解析 | P0 | 2h |
| 4. 角色卡 CRUD API | 后端路由 | P0 | 2h |
| 5. 角色卡编辑 UI | 前端表单 (多 Tab) | P1 | 4h |
| 6. 角色卡导入/导出 | 文件上传/下载 | P2 | 2h |
| 7. 预设模板 | 提供 3-5 个预设角色卡 | P2 | 2h |

**验收标准**:
- [ ] 可以为机器人配置角色卡
- [ ] 角色卡配置在 BotRuntime 中正确注入到 System Prompt
- [ ] AI 回复体现出角色性格差异

---

### Phase 1.2: World Info (预计 1-2 天)

| 任务 | 描述 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1. 数据库表创建 | `world_info` 表 | P0 | 0.5h |
| 2. WorldInfoManager 实现 | 关键词匹配逻辑 | P0 | 2h |
| 3. CRUD API | 后端路由 | P0 | 1h |
| 4. 管理 UI | 条目列表、编辑表单 | P1 | 3h |
| 5. Prompt 注入 | 在 BotRuntime 中注入 | P0 | 1h |

**验收标准**:
- [ ] 创建 World Info 条目
- [ ] 关键词触发后，AI 能获取到注入的信息
- [ ] Sticky 条目始终注入

---

### Phase 2.1: 长期记忆集成 (预计 2-3 天)

| 任务 | 描述 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1. MemoryBridge 实现 | 对接 LanceDB Pro | P0 | 3h |
| 2. 记忆存储 | 消息发送后自动存储 | P0 | 2h |
| 3. 记忆检索 | 发送消息前检索相关记忆 | P0 | 2h |
| 4. Prompt 注入 | 将记忆注入到上下文 | P0 | 1h |
| 5. 记忆管理 UI | 查看、删除记忆 | P2 | 3h |

**验收标准**:
- [ ] AI 能"记住"之前的对话内容
- [ ] 检索到的记忆准确相关

---

### Phase 2.2: 上下文压缩 (预计 2-3 天)

| 任务 | 描述 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1. ContextManager 实现 | 上下文存储和管理 | P0 | 3h |
| 2. SlidingWindowStrategy | 滑动窗口策略 | P0 | 2h |
| 3. SummarizationStrategy | 摘要策略 (调用 LLM) | P1 | 3h |
| 4. 自动压缩触发 | 超过阈值自动压缩 | P0 | 2h |
| 5. 配置界面 | 阈值、策略配置 | P2 | 2h |

**验收标准**:
- [ ] 对话超过 8000 字符自动压缩
- [ ] 压缩后保留关键信息
- [ ] 可切换压缩策略

---

### Phase 3: Skills + MCP (预计 4-5 天)

| 任务 | 描述 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1. SkillRegistry 实现 | 注册表 | P0 | 2h |
| 2. IntentDetector 实现 | 意图检测 | P0 | 3h |
| 3. WebSearchSkill | 网络搜索技能 | P1 | 4h |
| 4. CodeExecutorSkill | 代码执行技能 | P1 | 4h |
| 5. MCPLoader 实现 | MCP 服务器加载 | P1 | 3h |
| 6. MCPSkillWrapper | MCP 技能封装 | P1 | 2h |
| 7. 技能管理 UI | 启用/禁用、配置 | P2 | 3h |

**验收标准**:
- [ ] 可以注册自定义技能
- [ ] 意图检测准确
- [ ] MCP 工具可作为技能调用

---

## 验证计划

### 角色卡系统测试

1. 创建两个不同性格的角色卡
2. 用相同问题询问两个角色
3. 确认回复风格有明显差异

### World Info 测试

1. 创建技术栈条目 (关键词：技术栈、架构)
2. 询问"我们项目用的什么技术栈？"
3. 确认 AI 能正确回答项目技术栈

### 记忆系统测试

1. 告诉 AI 一个信息 (如：我喜欢吃苹果)
2. 开始新对话
3. 询问"我喜欢吃什么？"
4. 确认 AI 能回忆起信息

### 上下文压缩测试

1. 进行长对话 (超过 10000 字符)
2. 检查是否触发自动压缩
3. 压缩后继续对话，确认上下文连贯

---

## 配置示例

### 角色卡预设模板

```markdown
---
spec: chara-card-v2
template: assistant
---

# 专业助手

## 性格
专业、高效、友善。专注于解决问题，语言简洁清晰。

## 响应风格
- 结构化回答
- 提供具体步骤
- 主动询问澄清
```

### World Info 示例

```json
{
  "name": "项目技术栈",
  "keys": ["技术栈", "架构", "用什么"],
  "content": "本项目使用 React + TypeScript + TailwindCSS 前端，Node.js + Express 后端，SQLite 数据库。开发工具包括 VSCode、Git。",
  "priority": 100,
  "sticky": false
}
```

### 上下文压缩配置

```json
{
  "autoCompressThreshold": 8000,
  "targetTokenCount": 2000,
  "defaultStrategy": "sliding-window",
  "preserveLastNMessages": 5
}
```

---

## 关键决策记录

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 角色卡格式 | JSON / YAML+MD / DB | YAML+MD | 可读性好，易编辑，版本控制友好 |
| World Info 触发 | 关键词 / LLM / 混合 | 关键词 | 低成本，可控，第一版足够 |
| 记忆存储 | SQLite / LanceDB / Redis | LanceDB Pro | 已有基础设施，支持向量检索 |
| 压缩策略 | 滑动窗口 / 摘要 / 混合 | 滑动窗口 (默认) | 简单可靠，摘要策略作为可选 |

---

## 附录

### 相关文件

- `ARCHITECTURE.md` - 项目整体架构
- `TECH_DESIGN.md` - 技术设计文档
- `REQUIREMENTS.md` - 需求文档

### 参考资料

- [SillyTavern GitHub](https://github.com/SillyTavern/SillyTavern)
- SillyTavern Character Card V2 Spec
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**文档历史**:

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| v1.0 | 2026-03-08 | KK | 初始版本 |
