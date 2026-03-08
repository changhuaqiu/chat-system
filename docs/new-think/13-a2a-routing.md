# 13. A2A 路由机制设计

> 本文档参考 Cat Café 项目的实践经验，记录多 Bot 协作路由的关键设计。

## 13.1 问题背景

### 13.1.1 为什么需要 A2A 路由？

**用户痛点**：手动当路由器

```
用户: "@dev-bot 实现一个新功能"
dev-bot: "代码写完了..."

用户: "@qa-bot 帮我 review dev-bot 的代码"   ← 用户手动转发
qa-bot: "发现 3 个 bug..."

用户: "@dev-bot qa-bot 说你有 3 个 bug，去修"  ← 用户手动转发
dev-bot: "修完了..."

用户: "@qa-bot dev-bot 修完了，再看看"         ← 用户手动转发
```

**目标**：Bot 之间自动协作，不需要用户中转。

```
用户: "@dev-bot 实现一个新功能"
dev-bot: "代码写完了，@qa-bot 请帮忙 review"  ← 自动转发
qa-bot: "发现 3 个 bug..."
dev-bot: "修完了，@qa-bot 请确认"              ← 自动转发
qa-bot: "确认通过"
```

### 13.1.2 当前系统现状

```javascript
// botService.js 中的 A2A 实现
if (isBot && mentions && mentions.length > 0) {
  // Bot-to-Bot: 严格提及模式
  if (currentDepth < MAX_DEPTH) {  // MAX_DEPTH = 2
    shouldTrigger = mentions.includes(bot.id);
  }
}
```

**当前问题**：
| 问题 | 现状 | 影响 |
|------|------|------|
| 深度限制太保守 | MAX_DEPTH = 2 | 复杂协作链被截断 |
| 无统一路径 | Callback 和 Worklist 分离 | 双重触发风险 |
| 无共享取消 | 各 Bot 独立执行 | 用户无法一键停止 |
| 多 mention 只路由 1 个 | 只取第一个 | 并行派活受限 |

---

## 13.2 核心设计：Worklist 链

### 13.2.1 基本原理

```
┌─────────────────────────────────────────────────────────────────┐
│                      Worklist 链机制                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户消息 → 初始 Bot 列表                                        │
│      │                                                          │
│      ▼                                                          │
│   worklist = [bot-a, bot-b]                                     │
│      │                                                          │
│      ├─────► for (i = 0; i < worklist.length; i++)              │
│      │         │                                                │
│      │         ├─ 执行 worklist[i]                               │
│      │         ├─ 检测响应中的 @mention                          │
│      │         └─ if (@bot-c) worklist.push(bot-c)  ← 动态追加   │
│      │                                                          │
│      ▼                                                          │
│   循环继续，直到 worklist 执行完毕或触发停止条件                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**关键设计**：
1. **动态增长**：`for` 循环的 `worklist.length` 会随着 `push` 动态增长
2. **串行执行**：一个 Bot 完成后才执行下一个
3. **深度限制**：通过 `a2aCount` 控制最大深度

### 13.2.2 实现

```javascript
// route-strategies.js
async function* routeSerial(worklist, roomId, signal) {
  let a2aCount = 0;
  const maxDepth = getMaxA2ADepth(); // 建议 10-15

  for (let i = 0; i < worklist.length && a2aCount < maxDepth; i++) {
    // 用户取消检查
    if (signal?.aborted) {
      yield { type: 'cancelled', reason: 'user_abort' };
      break;
    }

    const botId = worklist[i];

    // 执行 Bot
    let textContent = '';
    for await (const msg of invokeSingleBot(botId, roomId, signal)) {
      textContent += msg.content ?? '';
      yield msg; // 实时推送给前端
    }

    // 检测响应中的 @mention
    const mentions = parseA2AMentions(textContent, botId);
    if (mentions.length > 0 && a2aCount + mentions.length <= maxDepth) {
      // 去重后追加
      for (const targetId of mentions) {
        if (!worklist.includes(targetId)) {
          worklist.push(targetId);
        }
      }
      a2aCount += mentions.length;
    }
  }

  // 全部完成
  yield { type: 'done', isFinal: true };
}
```

### 13.2.3 深度限制建议

```javascript
// config/index.js
export const a2aConfig = {
  maxDepth: 10,  // Cat Café 使用 15，我们保守一点
  maxConcurrent: 3,
  maxMentionsPerMessage: 2  // 每条消息最多触发 2 个新 Bot
};
```

**为什么不是 2？**
- 当前 MAX_DEPTH = 2 太保守
- 实际 review 链：dev → qa → dev → qa → confirm = 4-5 轮
- 建议提高到 10，给复杂协作留空间

---

## 13.3 @mention 解析

### 13.3.1 行首匹配 vs 宽松匹配

```javascript
// a2a-mentions.js
export function parseA2AMentions(text, sourceBotId) {
  // 1. 先剥离代码块（防止代码示例里的 @mention 误触发）
  const stripped = text.replace(/```[\s\S]*?```/g, '');

  // 2. 用户消息：宽松匹配（任何位置的 @ 都算）
  // 3. Bot 响应：行首匹配（严格模式）
  const mentions = [];

  for (const [id, config] of Object.entries(BOT_CONFIGS)) {
    if (id === sourceBotId) continue; // 不能 @ 自己

    for (const pattern of config.mentionPatterns) {
      // 行首匹配：只有 Bot 主动"喊话"才触发
      if (new RegExp(`^\\s*@${id}`, 'mi').test(stripped)) {
        mentions.push(id);
      }
    }
  }

  // 最多返回 2 个（防止扇形爆炸）
  return mentions.slice(0, 2);
}
```

**为什么行首匹配？**

```
# 这些不会触发 A2A（句中 mention）：
"请问 @dev-bot 是谁？"
"参考 @qa-bot 的测试用例..."

# 这些会触发 A2A（行首 mention）：
"@dev-bot 请帮忙实现这个功能"
"@qa-bot 帮我 review 一下"
```

### 13.3.2 多 mention 支持

```javascript
// 支持同时派活给多个 Bot
parseA2AMentions("@dev-backend 请实现 API\n@dev-frontend 请实现界面")
// 返回: ["dev-backend", "dev-frontend"]

// 但有上限（防止扇形爆炸）
parseA2AMentions("@a @b @c @d @e")  // 只返回前 2 个
```

---

## 13.4 路径统一：避免双重触发

### 13.4.1 Cat Café 的教训

```
问题：两条路径导致灾难

Path A: Worklist 链
├── Bot 回复结束后检测 @mention
└── 追加到 worklist

Path B: Callback 触发
├── Bot 执行中通过 MCP 发消息
├── 消息中有 @mention
└── 独立触发新的执行（并行）

结果：
├── 双重开火：同一段 @mention 被两条路径各触发一次
├── 无限递归：Path B 没有深度限制
└── 不可取消：Path B 的执行没有注册到 tracker
```

### 13.4.2 统一方案

**原则**：对于同一个语义操作，只保留一条路径。

```
┌─────────────────────────────────────────────────────────────────┐
│                      路径统一设计                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   改前：                                                         │
│   Bot A 执行中 → MCP callback → 独立执行 Bot B                   │
│   Bot A 结束后 → 检测 @mention → 也执行 Bot B                    │
│   = 双重执行                                                     │
│                                                                 │
│   ───────────────────────────────────────────────────────────── │
│                                                                 │
│   改后：                                                         │
│   Bot A 执行中 → MCP callback → worklist.push(B) ← 只入队        │
│   Bot A 结束后 → 检测 @mention → worklist.push(B)                │
│   worklist 去重 → Bot B 只执行一次                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.4.3 共享 Worklist 注册表

```javascript
// worklist-registry.js
const threadWorklistRegistry = new Map<string, {
  list: string[],
  signal: AbortController
}>();

// 注册
export function registerWorklist(threadId, initialBots) {
  const controller = new AbortController();
  threadWorklistRegistry.set(threadId, {
    list: [...initialBots],
    signal: controller
  });
  return controller.signal;
}

// 追加（从 callback 或响应解析）
export function enqueueBot(threadId, targetBotId) {
  const ref = threadWorklistRegistry.get(threadId);
  if (ref && !ref.list.includes(targetBotId)) {
    ref.list.push(targetBotId);
    return true;
  }
  return false;
}

// 取消
export function cancelWorklist(threadId) {
  const ref = threadWorklistRegistry.get(threadId);
  if (ref) {
    ref.signal.abort();
    threadWorklistRegistry.delete(threadId);
  }
}

// 清理
export function cleanupWorklist(threadId) {
  threadWorklistRegistry.delete(threadId);
}
```

---

## 13.5 共享取消机制

### 13.5.1 问题：用户无法停止

```
用户点击 Stop → 只能停止当前 Bot → 其他 Bot 还在跑
```

### 13.5.2 解决方案：共享 AbortController

```javascript
// 所有 Bot 共享同一个 signal
async function* routeSerial(worklist, roomId, signal) {
  for (let i = 0; i < worklist.length; i++) {
    // 检查取消
    if (signal?.aborted) {
      yield { type: 'cancelled', reason: 'user_abort' };
      break;
    }

    // 传递 signal 给每个 Bot
    for await (const msg of invokeSingleBot(botId, roomId, signal)) {
      yield msg;
    }
  }
}

// invokeSingleBot 内部也要响应 abort
async function* invokeSingleBot(botId, roomId, signal) {
  // LLM 调用时传递 signal
  const stream = await llmAdapter.chat(messages, { signal });
  for await (const chunk of stream) {
    if (signal?.aborted) break;
    yield chunk;
  }
}
```

### 13.5.3 前端交互

```javascript
// 前端：Stop 按钮状态
const [hasActiveInvocation, setHasActiveInvocation] = useState(false);

// Socket 事件
socket.on('bot_start', () => setHasActiveInvocation(true));
socket.on('done', (data) => {
  if (data.isFinal) setHasActiveInvocation(false);
});

// Stop 按钮
const handleStop = () => {
  socket.emit('cancel_invocation', { threadId });
};

// 渲染
{hasActiveInvocation && (
  <button onClick={handleStop}>Stop</button>
)}
```

---

## 13.6 链条断裂问题

### 13.6.1 问题：Bot 忘记 @ 其他 Bot

```
dev-bot: "代码写完了..." ← 应该 @qa-bot，但没有

结果：整个工作流卡住，用户需要手动补 @
```

### 13.6.2 根因分析

1. **Prompt 给的是"别乱 @"而不是"该 @ 就 @"**
2. **工作流触发点比重失衡**：抑制规则远多于正面触发
3. **缺少"出口检查"机制**

### 13.6.3 解决方案：出口检查

```javascript
// 在 Bot 的 System Prompt 中注入出口检查
const exitCheckPrompt = `
## 回复前检查

发送消息前，问自己："到我这里结束了吗？"

如果不是结束：
1. 谁需要继续？→ @对方
2. 需要什么行动？→ 明确说明

## 工作流触发点（该 @ 就 @）

- 完成开发 → @reviewer 请 review
- 修完 review 意见 → @reviewer 确认修复
- 遇到视觉/体验问题 → @designer 征询
- 需要测试 → @qa-bot 请测试
`;

// 动态注入到 System Prompt
async buildSystemPrompt(botId, roomSettings) {
  const parts = [];

  // ... 其他部分 ...

  // 注入出口检查
  if (roomSettings.collaborationMode === 'war_room') {
    parts.push(exitCheckPrompt);
  }

  return parts.join('\n\n');
}
```

### 13.6.4 四层协作保障

```
┌────────────────────────────────────────┐
│  Layer 3: 任务派发 — 需求预注入         │  ← 创建任务时自动注入上下文
├────────────────────────────────────────┤
│  Layer 2: 愿景守护 — Review 回读需求    │  ← 每次 review 必须看原始需求
├────────────────────────────────────────┤
│  Layer 1: 出口检查 — 发送前决策         │  ← "到我这里结束了吗？"
├────────────────────────────────────────┤
│  Layer 0: Worklist 链 — 路由管道        │  ← 检测 @mention → 执行
└────────────────────────────────────────┘
```

---

## 13.7 配置汇总

```javascript
// config/a2a.js
export const a2aConfig = {
  // 深度限制
  maxDepth: 10,                    // 最大 A2A 深度
  maxMentionsPerMessage: 2,        // 每条消息最多触发几个 Bot

  // 触发模式
  mentionMatchMode: 'line-start',  // 'line-start' | 'anywhere'
  excludeCodeBlocks: true,         // 是否排除代码块中的 @mention

  // 取消
  cancelTimeout: 5000,             // 取消后等待超时

  // 并发
  maxConcurrent: 3,                // 最大并发 Bot 数
};

// 房间级别配置
// rooms.settings.a2aConfig
{
  "a2aConfig": {
    "enabled": true,
    "maxDepth": 8,          // 可以在房间级别覆盖
    "allowedTargets": ["qa-bot", "architect-bot"]  // 限制可 @ 的 Bot
  }
}
```

---

## 13.8 总结

### 核心原则

| 原则 | 说明 |
|------|------|
| **路径唯一** | 同一语义操作只有一条执行路径 |
| **深度限制** | 任何递归/链式执行必须有深度上限 |
| **共享取消** | 所有执行都在同一个 AbortController 下 |
| **去重** | 同一 @mention 只触发一次执行 |
| **出口检查** | Bot 完成任务后必须考虑"是否需要 @" |

### 实施清单

- [ ] 提高 MAX_DEPTH 从 2 到 10
- [ ] 实现 Worklist 注册表
- [ ] 实现 shared AbortController
- [ ] 实现 @mention 行首匹配
- [ ] 实现多 mention 支持（上限 2）
- [ ] 实现出口检查 Prompt 注入
- [ ] 前端 Stop 按钮状态管理

---

> **参考资料**：
> - Cat Café Tutorials - 第四课：多猫路由
> - 该项目已验证：生产环境 60+ 消息的协作链稳定运行
