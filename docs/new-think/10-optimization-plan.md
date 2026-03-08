# 10. 优化建议

## 10.1 第一阶段：基础架构清理 (高优先级)

### 10.1.1 模块系统统一化

**目标**: 将 `agent-router.js` 转换为 ES Modules

**修改文件**: `backend/src/agent-router.js`

**操作**:
```javascript
// 改前
const axios = require('axios');
module.exports = agentRouter;

// 改后
import axios from 'axios';
export default agentRouter;
```

**风险**: 低
**工作量**: 0.5 天

### 10.1.2 清理备份文件

**目标**: 删除所有备份文件

**删除文件**:
- `backend/src/server.js.backup`, `.backup2`, `.backup3`
- `backend/src/server.js.bak`, `.bak2`, `.bak3`
- `frontend/src/pages/*.bak*`
- `frontend/src/services/api.js.bak`

**风险**: 低
**工作量**: 0.1 天

### 10.1.3 配置外置化

**目标**: 创建统一配置模块

**新建文件**: `backend/src/config/index.js`

```javascript
export const config = {
  openclaw: {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8000',
    sessionKeyTemplate: process.env.OPENCLAW_SESSION_KEY_TEMPLATE
  },
  server: {
    port: process.env.PORT || 3001
  }
};
```

**修改文件**:
- `backend/src/agent-router.js` - 使用 config.openclaw.gatewayUrl
- `backend/src/services/agentService.js` - 使用 config.openclaw.sessionKeyTemplate

**风险**: 低
**工作量**: 0.5 天

### 10.1.4 messageService 修复

**目标**: 正确初始化并导出服务实例

**修改文件**: `backend/src/services/messageService.js`

```javascript
import { db } from '../db.js';

class MessageService {
  // ... 现有实现
}

// 改前
export const messageService = null;

// 改后
export const messageService = new MessageService(db);
```

**风险**: 低
**工作量**: 0.5 天

---

## 10.2 第二阶段：后端架构重构 (高优先级)

### 10.2.1 OpenClaw 集成完善

**目标**: 实现 GatewayClient，完成 sessions_send 功能

**新建文件**: `backend/src/services/GatewayClient.js`

```javascript
import axios from 'axios';
import { config } from '../config/index.js';

export class GatewayClient {
  constructor(baseUrl = config.openclaw.gatewayUrl) {
    this.baseUrl = baseUrl;
  }

  async sessionsSend(sessionKey, message) {
    return axios.post(`${this.baseUrl}/api/v1/sessions/message`, {
      sessionKey,
      message
    });
  }
}

export const gatewayClient = new GatewayClient();
```

**修改文件**: `backend/src/services/agentService.js`

```javascript
import { gatewayClient } from './GatewayClient.js';

// 在 sendMessage 方法中使用
async sendMessage(agentId, message) {
  const sessionKey = this.agentSessions.get(agentId);
  const result = await gatewayClient.sessionsSend(sessionKey, message);
  // ...
}
```

**风险**: 中
**工作量**: 1 天

### 10.2.2 数据库索引优化

**目标**: 为 messages 表添加索引

**新建文件**: `backend/migrations/006_add_messages_indexes.js`

```javascript
import { db } from '../src/db.js';

export async function up() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC)');
      resolve();
    });
  });
}
```

**风险**: 低
**工作量**: 0.5 天

### 10.2.3 统一迁移运行器

**目标**: 创建迁移执行脚本

**新建文件**: `backend/migrations/run.js`

```javascript
import fs from 'fs';
import { db } from '../src/db.js';

async function runMigrations() {
  const files = fs.readdirSync('./migrations')
    .filter(f => f.match(/^\d+_.*\.js$/))
    .sort();

  for (const file of files) {
    console.log(`Running: ${file}`);
    await import(`./${file}`);
  }
}

runMigrations();
```

**风险**: 低
**工作量**: 0.5 天

---

## 10.3 第三阶段：前端架构优化 (中优先级)

### 10.3.1 RobotManagePage 组件拆分

**目标**: 将 1016 行的单文件拆分为组件目录

**新建目录结构**:
```
frontend/src/pages/RobotManagePage/
├── index.jsx              # 主入口
├── RobotStats.jsx         # 统计面板
├── RobotFilterBar.jsx     # 搜索过滤栏
├── RobotCard.jsx          # Bot 卡片
├── CreateEditModal.jsx    # 创建/编辑模态框
├── DeleteConfirmModal.jsx # 删除确认
├── OneApiStatusBar.jsx    # One-API 状态
├── constants.js           # PROVIDER_CONFIG
└── hooks/
    └── useBotForm.js      # 表单状态 Hook
```

**风险**: 中
**工作量**: 2 天

### 10.3.2 全局状态管理

**目标**: 创建 AgentContext 管理全局状态

**新建文件**: `frontend/src/contexts/AgentContext.jsx`

```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAgents().then(res => {
      setAgents(res.agents || []);
      setLoading(false);
    });
  }, []);

  return (
    <AgentContext.Provider value={{ agents, loading }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => useContext(AgentContext);
```

**风险**: 低
**工作量**: 0.5 天

### 10.3.3 性能优化

**目标**: 添加 useMemo/useCallback/React.memo

**修改文件**:
- `frontend/src/pages/ChatPage.jsx`
- `frontend/src/pages/LogPage.jsx`
- `frontend/src/components/Chat/ChatSidebar.jsx`

```javascript
// ChatPage.jsx
const members = useMemo(() => [
  { id: 'user', name: 'Current User', status: 'online' },
  ...agentList.map(a => ({ ...a }))
], [agentList]);

const handleSendMessage = useCallback((content, type, mediaUrl) => {
  // ...
}, [roomId, agentList, replyingTo]);

// ChatSidebar.jsx
export default React.memo(ChatSidebar);
```

**风险**: 低
**工作量**: 1 天

### 10.3.4 API 服务层优化

**目标**: 创建统一 API 客户端

**新建文件**: `frontend/src/services/apiClient.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000
});

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

**风险**: 低
**工作量**: 0.5 天

---

## 10.4 第四阶段：实时通信增强 (中优先级)

### 10.4.1 显式心跳机制

**目标**: 添加应用层心跳

**修改文件**:
- `frontend/src/services/api.js`
- `backend/src/server.js`

```javascript
// 服务端
socket.on('heartbeat', (data) => {
  socket.emit('heartbeat_ack', { timestamp: Date.now() });
});

// 客户端
setInterval(() => {
  socket.emit('heartbeat', { timestamp: Date.now() });
}, 25000);
```

**风险**: 低
**工作量**: 0.5 天

### 10.4.2 断线重连增强

**目标**: 创建连接状态监控 Hook

**新建文件**: `frontend/src/hooks/useSocketStatus.js`

```javascript
import { useState, useEffect } from 'react';
import { socket } from '../services/api';

export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { isConnected };
};
```

**风险**: 低
**工作量**: 0.5 天

---

## 10.5 实施路线图

```
Week 1-2: 第一阶段 - 基础清理
├── 模块系统统一化
├── 备份文件清理
├── 配置外置化
└── messageService 修复

Week 3-4: 第二阶段 - 后端重构
├── GatewayClient 创建
├── OpenClaw 集成完善
├── 数据库索引
└── 迁移运行器

Week 5-6: 第三阶段 - 前端优化
├── RobotManagePage 拆分
├── AgentContext 创建
├── 性能优化
└── API 客户端封装

Week 7-8: 第四阶段 - 实时通信
├── 心跳机制
└── 断线重连增强
```

## 10.6 验证步骤

### 第一阶段验证
```bash
cd backend && npm start
# 验证模块导入正常
# 验证无备份文件残留
ls **/*.bak **/*.backup
```

### 第二阶段验证
```bash
cd backend && node migrations/run.js
# 验证索引创建
sqlite3 data/chat.db ".indices messages"
# 测试 OpenClaw 连接
curl http://localhost:3001/api/agents
```

### 第三阶段验证
```bash
cd frontend && npm run dev
# 测试机器人管理页面功能
# 检查 React DevTools 无不必要重渲染
```

### 第四阶段验证
- 断开网络，观察重连提示
- 查看 Network 面板心跳请求
