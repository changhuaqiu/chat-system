# 11. 多机器人协作分析与建议

## 11.1 现有角色卡系统分析

### 11.1.1 Character Card V2 规范

当前系统已实现完整的 SillyTavern 风格角色卡：

```yaml
---
spec: chara-card-v2
name: 开发助手
description: 一位经验丰富的全栈开发者
personality: |
  专业、耐心、注重细节。热爱技术分享...
scenario: |
  你正在一个项目聊天室中...
mes_example: |
  <START>
  用户：这个 bug 怎么修？
  开发助手：让我看看...
avatar: 🧑‍💻
first_mes: 你好！我是你的开发助手...
system_prompt: |
  你是一位经验丰富的全栈开发者...
post_history_instructions: |
  确保回答简洁实用...
tags:
  - 开发
  - 技术
extensions:
  speakingStyle:
    tone: professional
    emojiUsage: sparse
    sentenceLength: medium
  restrictions:
    - 不提供未经测试的生产环境代码
  catchphrases:
    - "让我看看..."
    - "这是个有趣的问题"
---
```

### 11.1.2 已有组件

| 组件 | 文件 | 功能 |
|------|------|------|
| CharacterCardLoader | CharacterCardLoader.js | 接口定义 |
| YAMLLoader | loaders/YAMLLoader.js | YAML+Markdown 解析 |
| CharacterCardEditor | CharacterCardEditor.jsx | 前端编辑器 |
| 模板系统 | bots/config/templates/*.md | 预定义角色模板 |

### 11.1.3 角色卡在 BotRuntime 中的应用

```javascript
// botRuntime.js:95-188
async buildSystemPrompt(botId, card, worldInfo, agentRegistry) {
  const parts = [];

  // 1. Character Card System Prompt
  if (card) {
    if (card.system_prompt) parts.push(card.system_prompt);
    // ... personality, scenario, mes_example, speakingStyle
  }

  // 2. Agent Registry (其他 Bot 信息)
  if (agentRegistry) {
    parts.push(`[Agents in Room]\n${agentRegistry}`);
  }

  // 3. World Info
  if (worldInfo) parts.push(worldInfo);

  return parts.join('\n\n');
}
```

**关键发现**: Agent Registry 已经在 System Prompt 中注入，让每个 Bot 知道其他 Bot 的存在和能力！

---

## 11.2 当前协作机制分析

### 11.2.1 现有实现

```
┌─────────────────────────────────────────────────────────────────┐
│                     当前协作模式                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户消息                                                       │
│      │                                                          │
│      ▼                                                          │
│   ┌──────────────────────────────────────────┐                 │
│   │           BotService.onMessageCreated    │                 │
│   └──────────────────────────────────────────┘                 │
│      │                                                          │
│      ├─────► 遍历所有在线 Bot                                    │
│      │                                                          │
│      ├─────► 检查触发条件:                                       │
│      │      • 自由模式: 全部触发                                 │
│      │      • 提及模式: 被@的触发                                │
│      │      • A2A模式: 被@且深度<2                               │
│      │                                                          │
│      ▼                                                          │
│   ┌──────────────────────────────────────────┐                 │
│   │              执行队列                      │                │
│   │   MAX_CONCURRENT = 3                      │                │
│   └──────────────────────────────────────────┘                 │
│      │                                                          │
│      ├─────► Bot A ──► LLM ──► 响应A                            │
│      ├─────► Bot B ──► LLM ──► 响应B                            │
│      └─────► Bot C ──► LLM ──► 响应C                            │
│                                                                 │
│   特点: 各 Bot 独立响应，但知道其他 Bot 存在                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2.2 Agent Registry 机制 (已有)

```javascript
// botRuntime.js:193-215
async getAgentRegistry(excludeBotId) {
  const agents = rows.filter(b => b.id !== excludeBotId).map(b => {
    return `- @${b.id} (${b.name}): ${b.description} [Capabilities: ${caps}]`;
  });

  return `You are in a chatroom with other agents.
You can ask them for help by explicitly mentioning them (e.g. "@agent_id").
Available Agents:
${agents.join('\n')}`;
}
```

**效果**: 每个 Bot 知道其他 Bot 的存在，可以主动 @ 其他 Bot 寻求帮助。

### 11.2.3 当前问题

| 问题 | 描述 | 影响 |
|------|------|------|
| 无协作角色定义 | 角色卡无协作相关配置 | Bot 不知道自己的协作角色 |
| 无任务分解 | 复杂任务无法分解 | 效率低 |
| 无共享记忆 | Bot 之间上下文不互通 | 重复工作 |
| 无结果融合 | 多个 Bot 响应无法合并 | 信息碎片化 |

---

## 11.3 设计方案：职责分离

### 11.3.1 问题分析

**原始设计的问题**：
```
问题场景：
1. Bot 创建时加载角色卡 → extensions.collaboration.mode: war_room
2. 用户把这个 Bot 加入聊天室 → 房间模式 chat_room
3. 冲突：角色卡说"我是作战室成员"，但实际在聊天室
```

**根本原因**：角色卡混淆了"身份能力"和"协作角色"两个概念。

### 11.3.2 职责分离设计

```
┌─────────────────────────────────────────────────────────────────┐
│                      职责分离设计                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   角色卡 = 身份 + 能力        │
│                                                                 │
│   定义：我是谁？我能做什么？我能扮演什么角色？                     │
│                                                                 │
│   • name: 后端开发专家                                          │
│   • expertise: [coding, api, database]                         │
│   • personality: 专业、细致                                     │
│   • canWorkAs: [worker, expert]     ← 可扮演的角色类型          │
│   • style: {...}                     ← 说话风格                 │
│                                                                 │
│   特点：                                                        │
│   • 与房间无关，Bot 的固有属性                                   │
│   • 创建时确定，跨房间复用                                       │
│                                                                 │
│   ───────────────────────────────────────────────────────────── │
│                                                                 │
│   房间 = 场景 + 角色分配         │
│                                                                 │
│   定义：这是什么场景？每个 Bot 扮演什么角色？                      │
│                                                                 │
│   • collaborationMode: war_room      ← 协作模式                 │
│   • roleAssignments:                 ← 角色分配                 │
│       coordinator: "pm-bot"                                     │
│       workers: ["dev-01", "dev-02"]                             │
│       experts: ["architect-01"]                                 │
│                                                                 │
│   特点：                                                        │
│   • 与具体 Bot 无关，房间的配置                                  │
│   • 动态分配角色，灵活调整                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3.3 角色卡配置（重新设计）

角色卡只定义**能力**，不绑定具体协作模式：

```yaml
---
spec: chara-card-v2
name: 后端开发专家
description: 资深后端开发者，擅长系统设计和 API 开发

personality: |
  专业、细致、注重代码质量...

system_prompt: |
  你是一位资深后端开发者...

extensions:
  speakingStyle:
    tone: professional
    emojiUsage: sparse

  # ===== 能力定义（与房间无关）=====
  capabilities:
    expertise:
      - coding
      - api_design
      - database
      - system_design

    # 可扮演的协作角色
    canWorkAs:
      - worker      # 可以作为执行者
      - expert      # 可以作为专家提供意见

    # 跨场景的协作能力
    collaborationSkills:
      - task_execution     # 任务执行能力
      - code_review        # 代码评审能力
      - technical_advice   # 技术建议能力

    # 工作风格（适用于所有场景）
    workStyle:
      responseStyle: detailed    # detailed | concise
      codeQuality: high
      documentation: always
---
```

```yaml
---
spec: chara-card-v2
name: 项目经理
description: 团队协调者，负责任务分解和进度跟踪

extensions:
  capabilities:
    expertise:
      - planning
      - coordination
      - task_decomposition

    canWorkAs:
      - coordinator  # 可以作为协调者
      - reviewer     # 可以作为评审者

    collaborationSkills:
      - task_delegation    # 任务委派能力
      - progress_tracking  # 进度跟踪能力
      - result_aggregation # 结果汇总能力
---
```

### 11.3.4 房间配置（角色分配）

房间负责分配角色，决定协作流程：

```json
// rooms.settings 结构
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
    "resultAggregation": "coordinator_summary",
    "maxDepth": 2
  }
}
```

```json
// 聊天室配置
{
  "collaborationMode": "chat_room",
  "theme": "技术茶馆",
  "roleAssignments": {
    // 聊天室无严格角色分配，自由互动
    "participants": ["dev-01", "dev-02", "pm-bot"]
  },
  "interactionRules": {
    "autoRespondKeywords": ["bug", "架构", "代码"],
    "responseProbability": 0.5
  }
}
```

```json
// 专家会诊配置
{
  "collaborationMode": "panel",
  "topic": "系统架构评审",
  "roleAssignments": {
    "experts": ["architect-bot", "security-bot", "performance-bot"]
  },
  "voting": {
    "enabled": true,
    "consensusRule": "majority",
    "vetoPower": ["security-bot"]  // 安全专家有一票否决权
  }
}
```

### 11.3.5 角色分配验证

当 Bot 加入房间时，验证其能力是否匹配分配的角色：

```javascript
// botRuntime.js 伪代码
async validateRoleAssignment(botId, roomId) {
  const bot = await this.getBot(botId);
  const room = await this.getRoom(roomId);
  const card = bot.character_card;

  // 获取房间分配给该 Bot 的角色
  const assignedRole = this.getAssignedRole(botId, room.settings.roleAssignments);

  // 检查角色卡是否支持该角色
  const canWorkAs = card?.extensions?.capabilities?.canWorkAs || [];

  if (!canWorkAs.includes(assignedRole)) {
    console.warn(`Bot ${botId} cannot work as ${assignedRole}. ` +
                 `Supported roles: ${canWorkAs.join(', ')}`);
    return false;
  }

  return true;
}
```

### 11.3.6 动态上下文注入

在构建 System Prompt 时，根据房间配置动态注入角色：

```javascript
// botRuntime.js
async buildSystemPrompt(botId, card, roomSettings) {
  const parts = [];

  // 1. 角色卡固有内容
  if (card?.system_prompt) parts.push(card.system_prompt);

  // 2. 动态注入房间角色（来自房间配置，而非角色卡）
  const assignedRole = this.getAssignedRole(botId, roomSettings.roleAssignments);
  if (assignedRole) {
    parts.push(this.buildRoleContext(assignedRole, roomSettings));
  }

  // 3. 房间上下文
  if (roomSettings.collaborationMode) {
    parts.push(this.buildRoomContext(roomSettings));
  }

  return parts.join('\n\n');
}

buildRoleContext(role, roomSettings) {
  const roleDescriptions = {
    coordinator: `[Your Role in this Room: Coordinator]
You are the leader of this team.
You CAN delegate tasks to other agents.
You SHOULD summarize results at the end.`,

    worker: `[Your Role in this Room: Worker]
You are a team member.
You SHOULD execute tasks assigned by the coordinator.
You SHOULD report your progress.`,

    expert: `[Your Role in this Room: Expert]
You provide professional advice in your expertise area.
You SHOULD give independent opinions.`
  };

  return roleDescriptions[role] || '';
}

buildRoomContext(roomSettings) {
  return `[Room Mode: ${roomSettings.collaborationMode}]
[Goal: ${roomSettings.goal || 'General discussion'}]`;
}
```

### 11.3.2 扩展 YAMLLoader 支持协作配置

无需修改 YAMLLoader，它已经支持任意 extensions 字段！

只需在 `botRuntime.buildSystemPrompt` 中读取并注入协作上下文：

```javascript
// botRuntime.js 扩展
async buildSystemPrompt(botId, card, worldInfo, agentRegistry) {
  const parts = [];

  // 1. Character Card System Prompt (已有)
  if (card) { ... }

  // 2. Agent Registry (已有)
  if (agentRegistry) {
    parts.push(`[Agents in Room]\n${agentRegistry}`);
  }

  // 3. World Info (已有)
  if (worldInfo) parts.push(worldInfo);

  // ===== 新增：协作上下文 =====
  if (card?.extensions?.collaboration) {
    const collab = card.extensions.collaboration;
    parts.push(this.buildCollaborationContext(collab));
  }

  return parts.join('\n\n');
}

buildCollaborationContext(collab) {
  const lines = [`[Your Collaboration Role: ${collab.role}]`];

  if (collab.expertise?.length > 0) {
    lines.push(`Your expertise: ${collab.expertise.join(', ')}`);
  }

  if (collab.canDelegate) {
    lines.push(`You CAN delegate tasks to other agents when needed.`);
  }

  if (collab.preferredPartners?.length > 0) {
    lines.push(`Preferred partners: ${collab.preferredPartners.map(p => `@${p}`).join(', ')}`);
  }

  return lines.join('\n');
}
```

### 11.3.3 更新前端编辑器

在 `CharacterCardEditor.jsx` 的扩展设置 Tab 中添加协作配置：

```jsx
// CharacterCardEditor.jsx 新增

// 初始化协作配置
const [card, setCard] = useState({
  // ... 现有字段 ...
  extensions: {
    speakingStyle: { ... },
    restrictions: [],
    catchphrases: [],
    // 新增
    collaboration: {
      role: 'worker',
      expertise: [],
      canDelegate: false,
      maxSubordinates: 0,
      delegationRules: [],
      preferredPartners: []
    }
  }
});

// Tab 4: 扩展设置 - 添加协作配置区域
{activeTab === 'extensions' && (
  <>
    {/* 现有的 speakingStyle, tags, catchphrases, restrictions */}

    {/* ===== 新增：协作配置 ===== */}
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium text-gray-700 mb-3">协作配置</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            协作角色
          </label>
          <select
            value={card.extensions.collaboration?.role || 'worker'}
            onChange={(e) => updateCollaboration('role', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="coordinator">协调者 (Coordinator)</option>
            <option value="worker">执行者 (Worker)</option>
            <option value="expert">专家 (Expert)</option>
            <option value="reviewer">评审者 (Reviewer)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={card.extensions.collaboration?.canDelegate || false}
              onChange={(e) => updateCollaboration('canDelegate', e.target.checked)}
            />
            <span className="text-sm text-gray-700">可以委派任务</span>
          </label>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          专业领域 (逗号分隔)
        </label>
        <input
          type="text"
          value={card.extensions.collaboration?.expertise?.join(', ') || ''}
          onChange={(e) => updateCollaboration('expertise',
            e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          )}
          placeholder="coding, debugging, code_review"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          首选协作伙伴 (逗号分隔)
        </label>
        <input
          type="text"
          value={card.extensions.collaboration?.preferredPartners?.join(', ') || ''}
          onChange={(e) => updateCollaboration('preferredPartners',
            e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          )}
          placeholder="qa-tester, ux-design"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>
  </>
)}
```

---

## 11.4 房间模式与角色分配

### 11.4.1 设计理念

**核心原则**：
- **角色卡** 定义 Bot 的**身份和能力**（我是谁？能做什么？）
- **房间** 定义**协作场景和角色分配**（这是什么场景？谁扮演什么角色？）

```
┌─────────────────────────────────────────────────────────────────┐
│                      配置职责清晰分离                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   角色卡 (Character Card)                                       │
│   ─────────────────────                                         │
│   定义：身份 + 能力                                             │
│   问题：这个 Bot 是谁？能做什么？                                │
│                                                                 │
│   房间 (Room)                                                   │
│   ────────                                                      │
│   定义：场景 + 角色分配                                         │
│   问题：这是什么场景？谁扮演什么角色？                           │
│                                                                 │
│   匹配规则：                                                     │
│   room.roleAssignments → bot.card.canWorkAs                     │
│   房间分配的角色必须在角色卡支持的角色列表中                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4.2 房间模式详解

#### 11.4.2.1 作战室 (war_room)

**适用场景**: 有明确目标的项目开发、任务执行

**特点**:
- 有明确的 Leader (coordinator)
- 任务可分解和委派
- 结果需要汇总
- 有截止时间和交付物

**房间配置**:
```json
{
  "collaborationMode": "war_room",
  "goal": "完成用户认证模块开发",
  "deadline": "2024-03-15",
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

**参与 Bot 的角色卡能力**:

```yaml
# pm-bot 的角色卡（能力定义）
name: 项目经理
extensions:
  capabilities:
    expertise: [planning, coordination, task_decomposition]
    canWorkAs: [coordinator, reviewer]  # 可以担任协调者或评审者
```

```yaml
# dev-backend 的角色卡
name: 后端开发
extensions:
  capabilities:
    expertise: [backend, api, database]
    canWorkAs: [worker, expert]  # 可以担任执行者或专家
```

**协作流程**:
```
用户: "开发用户登录功能"

┌─────────────────────────────────────────────────────────────────┐
│ 作战室模式启动                                                   │
│                                                                 │
│ 1. pm-bot (被分配为 coordinator) 收到任务                        │
│    System Prompt 动态注入:                                       │
│    [Room Mode: War Room]                                        │
│    [Goal: 完成用户认证模块开发]                                   │
│    [Your Role: Coordinator - You are the leader]                │
│                                                                 │
│ 2. Coordinator 分解任务并委派                                     │
│    "@dev-backend 请实现登录 API                                  │
│     @dev-frontend 请实现登录界面                                 │
│     @qa-bot 请准备测试用例"                                      │
│                                                                 │
│ 3. Workers (dev-backend, dev-frontend) 执行                      │
│    System Prompt 注入: [Your Role: Worker]                       │
│                                                                 │
│ 4. Coordinator 汇总结果                                          │
│    "任务完成，汇总如下：..."                                      │
└─────────────────────────────────────────────────────────────────┘
```

**关键点**: 角色卡只定义能力，房间动态分配角色。同一个 pm-bot 可以：
- 在 A 作战室做 coordinator
- 在 B 专家会诊做 reviewer
- 在 C 聊天室自由参与

#### 11.4.2.2 聊天室 (chat_room)

**适用场景**: 日常交流、角色扮演、头脑风暴

**特点**:
- 无明确目标
- 扁平化互动
- 角色扮演为主
- 自由发言

**房间配置**:
```json
{
  "collaborationMode": "chat_room",
  "theme": "技术茶馆",
  "roleAssignments": {
    // 聊天室无严格角色分配，所有人都是 participant
    "participants": ["dev-01", "dev-02", "pm-bot"]
  },
  "interactionRules": {
    "mode": "free",
    "autoRespondKeywords": ["bug", "架构", "代码"],
    "responseProbability": 0.5
  }
}
```

**参与 Bot 的角色卡能力**:

```yaml
# 老张的角色卡
name: 老张
description: 资深程序员，爱讲段子
extensions:
  capabilities:
    expertise: [coding, debugging, system_design]
    canWorkAs: [worker, expert, participant]  # participant = 自由参与
  personality:
    style: humorous
    catchphrases: ["想当年...", "这个嘛..."]
  autoRespond:
    keywords: ["bug", "架构", "代码"]
    probability: 0.7
```

**协作流程**:
```
用户: "最近有个 bug 真是头疼"

┌─────────────────────────────────────────────────────────────────┐
│ 聊天室自由互动                                                   │
│                                                                 │
│ System Prompt 注入:                                             │
│ [Room Mode: Chat Room]                                          │
│ [Theme: 技术茶馆]                                                │
│ [Your Role: Participant - Feel free to chat naturally]          │
│                                                                 │
│ 老张: "哈哈，想当年我也遇到过，那个 bug 藏得..."                 │
│ 用户: "是并发问题"                                               │
│ 老张: "并发啊，这个要注意锁的粒度..."                            │
│                                                                 │
│ 特点: 自然对话，无任务分配，按角色卡 personality 响应             │
└─────────────────────────────────────────────────────────────────┘
```

**关键点**: 同一个 Bot（老张）可以：
- 在聊天室自由聊天
- 在作战室作为 Worker 执行任务
- 在专家会诊作为 Expert 提供意见

#### 11.4.2.3 专家会诊 (panel)

**适用场景**: 架构评审、技术决策、问题诊断

**特点**:
- 多专家独立意见
- 无 Leader
- 可能需要投票决策
- 专业性强

**房间配置**:
```json
{
  "collaborationMode": "panel",
  "topic": "系统架构评审",
  "roleAssignments": {
    "experts": ["architect-bot", "security-bot", "performance-bot"]
  },
  "voting": {
    "enabled": true,
    "consensusRule": "majority",
    "vetoPower": ["security-bot"]
  }
}
```

**参与 Bot 的角色卡能力**:

```yaml
# architect-bot 的角色卡
name: 架构师
extensions:
  capabilities:
    expertise: [architecture, scalability, design_pattern]
    canWorkAs: [expert, reviewer]
  votingBehavior:
    defaultWeight: 1
    outputFormat: "structured_opinion"
```

```yaml
# security-bot 的角色卡
name: 安全专家
extensions:
  capabilities:
    expertise: [security, encryption, authentication]
    canWorkAs: [expert, reviewer]
  votingBehavior:
    defaultWeight: 1
    vetoOnIssues: ["security_vulnerability", "data_leak"]  # 特定问题有一票否决
```

**协作流程**:
```
用户: "请评审一下这个微服务架构方案"

┌─────────────────────────────────────────────────────────────────┐
│ 专家会诊模式                                                     │
│                                                                 │
│ System Prompt 注入:                                             │
│ [Room Mode: Panel]                                              │
│ [Topic: 系统架构评审]                                            │
│ [Your Role: Expert - Provide independent professional opinion]  │
│                                                                 │
│ 架构师: "从可扩展性角度，建议..."                               │
│ 安全专家: "存在安全风险：..."                                   │
│ 性能专家: "性能方面考虑..."                                     │
│                                                                 │
│ [投票决策 - 由房间配置触发]                                      │
│ 结果: 方案需要修改，解决安全问题后重新评审                       │
└─────────────────────────────────────────────────────────────────┘
```

#### 11.4.2.4 独立模式 (standalone)

**适用场景**: 单一专家咨询、简单问答

**特点**:
- 单 Bot 工作
- 无协作需求
- 直接响应用户

**房间配置**:
```json
{
  "collaborationMode": "standalone",
  "roleAssignments": {
    "primary": "assistant-bot"
  }
}
```

### 11.4.3 一个 Bot 的多场景适配

**核心优势**: 同一个 Bot 可以在不同房间扮演不同角色。

```
┌─────────────────────────────────────────────────────────────────┐
│               Bot: dev-backend 的多场景角色适配                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  角色卡能力定义:                                                 │
│  canWorkAs: [worker, expert, participant]                       │
│  expertise: [backend, api, database]                            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  场景 A: 登录功能作战室                                          │
│  房间: { collaborationMode: "war_room" }                        │
│  分配角色: worker                                                │
│  行为: 执行 pm-bot 分配的 API 开发任务                           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  场景 B: 架构评审专家会诊                                        │
│  房间: { collaborationMode: "panel" }                           │
│  分配角色: expert                                                │
│  行为: 提供后端架构方面的专业意见                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  场景 C: 技术茶馆聊天室                                          │
│  房间: { collaborationMode: "chat_room" }                       │
│  分配角色: participant                                           │
│  行为: 自由参与讨论，分享后端经验                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4.4 角色分配验证流程

当 Bot 加入房间时，系统验证角色匹配：

```
Bot 加入房间流程:

1. 读取 Bot 角色卡
   ↓
2. 读取房间配置 (settings.roleAssignments)
   ↓
3. 查找该 Bot 被分配的角色
   ↓
4. 验证: assignedRole ∈ card.canWorkAs ?
   ↓
   ├─ YES → 加入成功，注入对应角色的 System Prompt
   │
   └─ NO  → 警告: "该 Bot 不支持此角色"
            可选: 自动降级到 participant 角色
```

---

## 11.5 协作模式与角色卡结合

### 11.5.1 主从协作模式 (Master-Worker)

**协调者角色卡示例**:
```yaml
name: 主管
extensions:
  collaboration:
    role: coordinator
    canDelegate: true
    delegationRules:
      - condition: "涉及UI"
        delegateTo: ["ux-design"]
      - condition: "涉及代码"
        delegateTo: ["dev", "fullstack-dev"]
```

**Worker 角色卡示例**:
```yaml
name: 开发助手
extensions:
  collaboration:
    role: worker
    expertise: [coding, debugging]
    canDelegate: false
```

### 11.5.2 专家会诊模式 (Panel)

**专家角色卡示例**:
```yaml
name: UX设计师
extensions:
  collaboration:
    role: expert
    expertise: [ui_design, ux_research, prototype]
    canDelegate: false
```

```yaml
name: 测试工程师
extensions:
  collaboration:
    role: expert
    expertise: [testing, bug_analysis]
    canDelegate: false
```

### 11.5.3 协作流程示例

```
用户: "帮我开发一个用户登录功能"

┌─────────────────────────────────────────────────────────────────┐
│ 主管 (Coordinator) 收到消息                                      │
│                                                                 │
│ System Prompt 包含:                                             │
│ [Your Collaboration Role: coordinator]                          │
│ You CAN delegate tasks to other agents when needed.             │
│                                                                 │
│ Available Agents:                                               │
│ - @ux-design (UX设计师): 负责界面设计 [Capabilities: ui, ux]    │
│ - @dev (开发助手): 负责代码实现 [Capabilities: coding, api]      │
│ - @qa-tester (测试工程师): 负责测试 [Capabilities: testing]     │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
主管判断需要委派，输出:
"我来协调这个任务。
@ux-design 请设计登录界面
@dev 请实现登录 API
@qa-tester 请准备测试用例"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 各 Worker 收到 @提及 后响应                                      │
│                                                                 │
│ ux-design: "登录界面设计方案:..."                               │
│ dev: "登录 API 实现方案:..."                                    │
│ qa-tester: "测试用例:..."                                       │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
主管汇总输出最终方案
```

---

## 11.6 实施建议

### 11.6.1 分阶段实施

```
Phase 1 (最小改动):
├── 扩展 extensions.collaboration 字段
├── 更新前端编辑器支持协作配置
└── 在 buildSystemPrompt 中注入协作上下文

Phase 2 (增强协作):
├── 实现 SharedContextManager (共享上下文)
├── 实现任务分解提示 (在 coordinator 的 system prompt 中)
└── 实现结果融合提示

Phase 3 (高级功能):
├── 协作会话管理
├── 任务队列优化
└── 协作效果评估
```

### 11.6.2 现有模板更新建议

更新现有角色卡模板，添加协作配置：

```yaml
# bots/config/templates/dev-helper.md
---
spec: chara-card-v2
name: 开发助手
# ... 现有字段 ...
extensions:
  speakingStyle:
    tone: professional
    emojiUsage: sparse
    sentenceLength: medium
  restrictions:
    - 不提供未经测试的生产环境代码
  catchphrases:
    - "让我看看..."
  # 新增
  collaboration:
    role: worker
    expertise:
      - coding
      - debugging
      - code_review
    canDelegate: false
    preferredPartners:
      - qa-tester
      - ux-design
---
```

### 11.6.3 无需修改的现有能力

| 能力 | 状态 | 说明 |
|------|------|------|
| Agent Registry | ✅ 已有 | Bot 已知道其他 Bot 存在 |
| A2A 通信 | ✅ 已有 | @提及 可触发其他 Bot |
| 循环检测 | ✅ 已有 | MAX_DEPTH 防止无限循环 |
| YAMLLoader | ✅ 已有 | 支持任意 extensions 字段 |
| 角色卡编辑器 | ✅ 已有 | 可扩展 Tab 添加协作配置 |

### 11.6.4 需要改进的能力

| 能力 | 当前问题 | 改进建议 |
|------|---------|---------|
| MAX_DEPTH | 当前为 2，太保守 | 提高到 10（详见 [13-A2A路由](./13-a2a-routing.md)） |
| A2A 路径 | 无统一路径 | 实现 Worklist 链机制 |
| 取消机制 | 各 Bot 独立 | 共享 AbortController |

---

## 11.7 总结

**核心设计**: 职责分离 - 角色卡定义能力，房间分配角色

```
┌─────────────────────────────────────────────────────────────────┐
│                      职责分离架构                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  角色卡 (Character Card)                                        │
│  ─────────────────────                                          │
│  定义：我是谁？我能做什么？                                       │
│  • name, description, personality                               │
│  • expertise: [coding, api, ...]                                │
│  • canWorkAs: [worker, expert, participant]                     │
│                                                                 │
│  特点：与房间无关，Bot 的固有属性，跨房间复用                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  房间 (Room)                                                    │
│  ────────                                                       │
│  定义：什么场景？谁扮演什么角色？                                 │
│  • collaborationMode: war_room | chat_room | panel              │
│  • roleAssignments: { coordinator: "...", workers: [...] }      │
│                                                                 │
│  特点：与 Bot 无关，房间的配置，动态分配角色                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  匹配规则：                                                      │
│  房间分配的角色 ∈ 角色卡支持的角色                               │
│                                                                 │
│  示例：                                                          │
│  dev-backend 角色卡 canWorkAs: [worker, expert]                 │
│  → 可在作战室担任 worker                                        │
│  → 可在专家会诊担任 expert                                      │
│  → 不能担任 coordinator（角色卡不支持）                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**优势**:
1. ✅ 解决"角色卡绑定场景"的逻辑矛盾
2. ✅ 同一 Bot 可在多种场景中工作
3. ✅ 角色分配灵活，可动态调整
4. ✅ 无需新增数据库表 (利用 rooms.settings JSON)
5. ✅ 保持 SillyTavern V2 规范兼容

**实施要点**:
1. 扩展 `rooms.settings` 支持 `collaborationMode` 和 `roleAssignments`
2. 角色卡 `extensions.capabilities.canWorkAs` 定义可扮演角色
3. `botRuntime.buildSystemPrompt` 根据房间分配动态注入角色上下文
4. 加入房间时验证角色匹配
