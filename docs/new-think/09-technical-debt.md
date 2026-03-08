# 9. 技术债务与问题

## 9.1 代码规范问题

### 9.1.1 模块系统不统一

**问题**: `agent-router.js` 使用 CommonJS，其他文件使用 ES Modules

```javascript
// agent-router.js (CommonJS) ⚠️
const axios = require('axios');
module.exports = agentRouter;

// 其他文件 (ES Modules) ✅
import axios from 'axios';
export default agentService;
```

**影响**:
- 导入方式不一致
- package.json 配置 `"type": "module"`
- 可能导致运行时错误

**优先级**: 高

### 9.1.2 备份文件残留

**问题**: 存在多个 `.bak` 和 `.backup` 文件

```
backend/src/server.js.backup
backend/src/server.js.backup2
backend/src/server.js.backup3
backend/src/server.js.bak
backend/src/server.js.bak2
backend/src/server.js.bak3
frontend/src/pages/*.bak*
frontend/src/services/api.js.bak
```

**影响**:
- 代码库混乱
- 版本控制污染

**优先级**: 中

### 9.1.3 服务导出问题

**问题**: `messageService.js` 导出 `null`

```javascript
// messageService.js
export class MessageService { ... }
export const messageService = null; // Will be initialized with database
```

**影响**:
- 服务未正确初始化
- 其他模块导入后得到 `null`

**优先级**: 高

## 9.2 配置管理问题

### 9.2.1 硬编码配置

**问题**: 多处硬编码 URL 和配置

```javascript
// agent-router.js:24 ⚠️
const response = await axios.get('http://localhost:8000/api/agents');

// agentService.js:189 ⚠️
const sessionKey = `agent:${agent.id}:feishu:group:oc_7c67a3a4814e100e92a4eea9a27afd95`;
```

**影响**:
- 无法通过环境变量配置
- 部署到不同环境需要修改代码
- 不利于自动化部署

**优先级**: 高

### 9.2.2 配置分散

**问题**: 配置读取分散在各个文件中

```javascript
// server.js
const PORT = process.env.PORT || 3001;

// OneApiService.js
this._oneApiUrl = process.env.ONE_API_BASE_URL || 'http://localhost:3002';
this._rootToken = process.env.ONE_API_ROOT_TOKEN || '123456';
```

**影响**:
- 缺少统一的配置入口
- 难以查看所有可配置项

**优先级**: 中

## 9.3 架构问题

### 9.3.1 前端组件过大

**问题**: `RobotManagePage.jsx` 1016 行

**当前结构**:
- 常量定义
- 主组件 (30+ useState)
- 内联组件 (RobotCard)
- 内联 Modal (CreateEditBotModal)

**影响**:
- 难以维护
- 性能问题
- 测试困难

**优先级**: 高

### 9.3.2 缺少全局状态管理

**问题**: Agent 列表在多个页面重复获取

```javascript
// ChatPage.jsx
const [agentList, setAgentList] = useState([]);
useEffect(() => {
  apiService.getAgents().then(res => {
    setAgentList(res.agents || []);
  });
}, []);

// RobotManagePage.jsx
const [robots, setRobots] = useState([]);
// 类似的获取逻辑
```

**影响**:
- 重复请求
- 状态不同步
- 性能浪费

**优先级**: 中

### 9.3.3 缺少 API 客户端封装

**问题**: 每个请求都需要完整 URL

```javascript
// api.js
const response = await axios.get(`${API_BASE_URL}/api/bots`);
```

**影响**:
- 代码重复
- 无统一错误处理
- 无请求/响应拦截

**优先级**: 中

## 9.4 数据库问题

### 9.4.1 缺少索引

**问题**: `messages` 表缺少索引

**影响**:
- 大数据量查询慢
- 分页性能差

**建议索引**:
```sql
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_room_timestamp ON messages(room_id, timestamp DESC);
```

**优先级**: 中

### 9.4.2 无迁移运行器

**问题**: 迁移文件存在但无统一执行方式

```
migrations/
├── 001_agent_migration.js
├── 002_add_provider_support.js
├── ...
└── 005_add_world_info.js

# 无 run.js
```

**影响**:
- 迁移执行不明确
- 新环境初始化困难

**优先级**: 中

## 9.5 实时通信问题

### 9.5.1 缺少心跳机制

**问题**: 依赖 Socket.io 内置心跳，无应用层心跳

**影响**:
- 僵尸连接检测慢
- 断线感知延迟

**优先级**: 低

### 9.5.2 断线无状态恢复

**问题**: 断线后无法恢复消息

**影响**:
- 用户需手动刷新
- 可能丢失消息

**优先级**: 低

## 9.6 OpenClaw 集成问题

### 9.6.1 sessions_send 未实现

```javascript
// agentService.js:7
const sessionsSend = (sessionKey, message) => {
  // 实际实现应调用 gateway sessions_send
  console.log(`Sending to session ${sessionKey}:`, message);
  // TODO: 捕获返回值并处理响应
};
```

**影响**:
- Agent 消息无法真正发送
- 功能不完整

**优先级**: 高

### 9.6.2 Agent 初始化硬编码

```javascript
// agentService.js:141-184
const defaultAgents = [
  { id: 'main', name: '主管 - main', ... },
  { id: 'dev', name: '开发 - dev', ... },
  // ... 硬编码的 Agent 列表
];
```

**影响**:
- 无法动态配置
- 需要修改代码才能增删 Agent

**优先级**: 中

## 9.7 问题汇总

| 问题 | 优先级 | 影响范围 | 难度 |
|------|--------|----------|------|
| 模块系统不统一 | 高 | agent-router.js | 低 |
| messageService 导出 null | 高 | messageService.js | 低 |
| 硬编码配置 | 高 | 多处 | 中 |
| sessions_send 未实现 | 高 | agentService.js | 中 |
| RobotManagePage 过大 | 高 | 前端 | 高 |
| 备份文件残留 | 中 | 整体 | 低 |
| 缺少数据库索引 | 中 | 性能 | 低 |
| 无迁移运行器 | 中 | 部署 | 低 |
| 缺少全局状态管理 | 中 | 前端 | 中 |
| 缺少 API 客户端封装 | 中 | 前端 | 低 |
| 断线恢复 | 低 | 实时通信 | 中 |
| 心跳机制 | 低 | 实时通信 | 低 |
