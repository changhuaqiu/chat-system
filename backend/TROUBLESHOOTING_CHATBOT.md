# 聊天室机器人不回复问题排查报告

**日期**: 2026-03-08
**状态**: 已解决
**问题**: 聊天室机器人不回复消息

---

## 问题描述

用户反馈在聊天室中给机器人发送消息（包括 @提及），机器人没有回复。

---

## 排查过程

### 1. 检查机器人状态

```bash
sqlite3 chat.db "SELECT id, name, provider_type, status FROM bots;"
```

**结果**:
```
bot-mmhgh4mb | 测试接入 | openai | online
```

机器人状态为 `online`，状态正常。

### 2. 检查消息历史

```bash
sqlite3 chat.db "SELECT id, sender, content, room_id, timestamp FROM messages ORDER BY rowid DESC LIMIT 10;"
```

**结果**:
```
1772960351391 | user | 大家好 | ...
1772960350149 | user | 你好 | ...
1772960348349 | user | @测试接入 你好 | ...
```

只有用户发送的消息，**没有机器人回复**。

### 3. 检查事件总线

```bash
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('chat.db');
db.all('SELECT * FROM events ORDER BY created_at DESC LIMIT 10', ...);
"
```

**结果**:
```
- ae7ee912...: message.created from agent:user:user to room:...
- 2fafebb7...: agent.typing from agent:bot-mmhgh4mb to room:...
- a841148b...: agent.stopped_typing from agent:bot-mmhgh4mb to room:...
```

**关键发现**:
- 有 `message.created` 事件（用户消息）
- 有 `agent.typing` 和 `agent.stopped_typing` 事件（机器人正在输入）
- **但没有机器人的 `message.created` 事件**

这说明机器人被触发了，但在发送回复之前失败了。

### 4. 检查机器人配置

```bash
sqlite3 chat.db "SELECT id, name, provider_type, config FROM bots WHERE id='bot-mmhgh4mb';"
```

**结果**:
```json
{
  "model": "qwen3.5-plus",
  "provider": "openai",
  "variant": "default",
  "baseUrl": "http://8.145.44.153:3000/v1",
  "apiKey": "kjWHsiSk2wlMFiNa7851975e4d7d4dA18607Fd823c729104",
  "originalProvider": "openai",
  "originalModel": "qwen3.5-plus"
}
```

配置看起来正常，baseUrl 指向 One-API 服务。

### 5. 测试 LLM API 连接

```bash
node -e "
const axios = require('axios');
axios.post('http://8.145.44.153:3000/v1/chat/completions', {
    model: 'qwen3.5-plus',
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 10
}, {
    headers: {
        'Authorization': 'Bearer kjWHsiSk2wlMFiNa7851975e4d7d4dA18607Fd823c729104',
        'Content-Type': 'application/json'
    },
    timeout: 5000
});
"
```

**结果**:
```
API Error: Request failed with status code 401
Response status: 401
```

**401 认证错误**！

### 6. 详细错误信息

```bash
API Error: Request failed with status code 401
Response data: {"error":{"message":"令牌 Token-bot-mmhgh4mb（#19）额度已用尽 (request id: 2026030817151891331378452395461)","type":"one_api_error"}}
```

---

## 根本原因

**机器人的 One-API Token 额度已用尽**

错误信息：
```
令牌 Token-bot-mmhgh4mb（#19）额度已用尽
```

这意味着：
1. 该机器人是通过 One-API 创建的
2. One-API 中为此机器人创建的 token (`Token-bot-mmhgh4mb`, ID: 19) 剩余额度为 0
3. 所有 LLM API 调用都返回 401 错误
4. `botService.triggerBot()` 中 `generateResponse()` 调用失败
5. 由于失败，没有发布 `message.created` 事件
6. 前端收不到机器人回复

---

## 代码流程分析

```
用户发送消息 (@测试接入)
    ↓
eventBus.publish('message.created')
    ↓
BotService.onMessageCreated() 收到事件
    ↓
检查在线机器人 (status = 'online')
    ↓
检查触发条件 (mention 模式)
    ↓
BotService.triggerBot(bot-mmhgh4mb)
    ↓
发布 agent.typing 事件 ✓
    ↓
botRuntime.generateResponse()
    ↓
LlmAdaptor.chat() → POST /chat/completions
    ↓
API 返回 401 (额度已用尽) ✗
    ↓
catch (error) → 记录错误日志
    ↓
finally → 发布 agent.stopped_typing 事件 ✓
    ↓
没有发布 message.created 事件 ✗
```

---

## 解决方案

### 方案 1: 在 One-API 管理界面增加额度（推荐）

1. 登录 One-API 管理界面（`http://8.145.44.153:3000`）
2. 进入「令牌」或「Tokens」页面
3. 找到 `Token-bot-mmhgh4mb` (ID: 19)
4. 编辑令牌，增加剩余额度（`remain_quota`）
5. 保存后，机器人即可恢复正常

**注意**: 如果编辑时报错 `Cannot read properties of null (reading 'split')`，这是 One-API 前端的一个 bug。可以尝试：
- 刷新页面后重试
- 使用浏览器的开发者工具查看具体哪个字段为 null
- 联系 One-API 管理员直接在数据库中修改

---

## 修复验证

**修复时间**: 2026-03-08
**修复方式**: 方案 1 - 在 One-API 管理界面增加令牌额度

验证测试：
```
✅ API 连接成功！
回复内容：Hello! How can I help you today?
```

### 方案 2: 删除并重新创建机器人

1. 在机器人管理页面删除 `测试接入` 机器人
2. 重新创建机器人（会创建新的 token，有初始额度）

### 方案 3: 直接更新数据库中的 API Key

如果有其他有效的 API Key：

```sql
UPDATE bots
SET config = json_patch(config, '{"apiKey": "新的有效 API Key"}')
WHERE id = 'bot-mmhgh4mb';
```

---

## 验证方法

修复后，可以通过以下方式验证：

### 1. 测试 API 连接

```bash
node -e "
const axios = require('axios');
axios.post('http://8.145.44.153:3000/v1/chat/completions', {
    model: 'qwen3.5-plus',
    messages: [{ role: 'user', content: 'hello' }]
}, {
    headers: { 'Authorization': 'Bearer <token>' }
}).then(r => console.log('Success:', r.data));
"
```

### 2. 在聊天室发送测试消息

```
@测试接入 你好
```

### 3. 检查事件表

```bash
sqlite3 chat.db "SELECT * FROM events WHERE source LIKE 'agent:bot-%' ORDER BY created_at DESC LIMIT 5;"
```

应该能看到 `message.created` 事件。

### 4. 查看后端日志

```
[BotService] Triggering bot bot-mmhgh4mb
[LlmAdaptor] Initializing with model: qwen3.5-plus
[BotService] Processing message.created: xxx from agent:bot-mmhgh4mb
```

---

## 常见问题 checklist

当聊天室机器人不回复时，按以下顺序检查：

- [ ] **机器人状态**: `SELECT status FROM bots WHERE id = ?` 应该是 `'online'`
- [ ] **触发条件**: 消息是否包含 `@机器人名称` 或 `@机器人 ID`
- [ ] **事件表**: 是否有机器人的 `agent.typing` 但没有 `message.created`
- [ ] **API 测试**: 直接调用 LLM API 是否返回成功
- [ ] **One-API 额度**: Token 剩余额度是否大于 0
- [ ] **日志检查**: 后端日志中是否有错误信息

---

## 相关代码文件

| 文件 | 说明 |
|------|------|
| `backend/src/services/botService.js` | 机器人触发逻辑 |
| `backend/src/services/botRuntime.js` | 机器人运行时 |
| `backend/src/adaptors/LlmAdaptor.js` | LLM API 调用 |
| `backend/src/services/eventBus.js` | 事件总线 |

---

## 后续改进建议

1. **额度预警**: 在 One-API 中设置额度预警，低于阈值时通知管理员
2. **错误提示**: 在机器人回复失败时，发送系统消息提示用户
3. **自动续费**: 为常用机器人设置自动增加额度
4. **监控面板**: 添加机器人健康和额度监控面板

---

**报告完成时间**: 2026-03-08
