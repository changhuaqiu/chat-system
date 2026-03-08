# 4. 前端架构

## 4.1 目录结构

```
frontend/
├── src/
│   ├── components/            # UI 组件
│   │   ├── Layout.jsx         # 页面布局
│   │   ├── Sidebar.jsx        # 侧边栏
│   │   ├── AgentList.jsx      # Agent 列表
│   │   ├── BotAvatar.jsx      # Bot 头像
│   │   ├── EmojiPicker.jsx    # 表情选择器
│   │   │
│   │   ├── Chat/              # 聊天相关组件
│   │   │   ├── ChatArea.jsx   # 聊天主区域
│   │   │   ├── ChatSidebar.jsx# 聊天室列表
│   │   │   ├── MemberSidebar.jsx # 成员列表
│   │   │   └── InviteModal.jsx# 邀请弹窗
│   │   │
│   │   ├── Message/           # 消息组件
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── TextMessage.jsx
│   │   │   ├── ImageMessage.jsx
│   │   │   ├── FileMessage.jsx
│   │   │   ├── CodeMessage.jsx
│   │   │   └── SystemMessage.jsx
│   │   │
│   │   └── WorldInfo/         # World Info 组件
│   │       └── WorldInfoManager.jsx
│   │
│   ├── pages/                 # 页面组件
│   │   ├── ChatPage.jsx       # 聊天页 (324行)
│   │   ├── RobotManagePage.jsx# 机器人管理 (1016行 ⚠️)
│   │   ├── LogPage.jsx        # 日志页 (155行)
│   │   ├── DashboardPage.jsx  # 仪表盘
│   │   ├── AdminPage.jsx      # 管理页
│   │   ├── ApiKeysPage.jsx    # API Key 管理
│   │   ├── CreateChatroomPage.jsx
│   │   └── CharacterCardEditor.jsx
│   │
│   ├── services/              # API 服务
│   │   └── api.js             # API 客户端 (359行)
│   │
│   ├── main.jsx               # 入口文件
│   └── index.css              # 样式文件
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 4.2 页面组件分析

### 4.2.1 RobotManagePage.jsx (1016行) - 需要重构

**问题**:
- 单文件超过 1000 行
- 包含多个子组件定义
- 状态管理复杂

**当前结构**:
```javascript
// RobotManagePage.jsx

// 1. PROVIDER_CONFIG 常量定义 (58行)
const PROVIDER_CONFIG = { ... };

// 2. 主组件
const RobotManagePage = () => {
  // 状态定义 (30+ 个 useState)
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... 更多状态

  // 副作用
  useEffect(() => { ... }, []);

  // 事件处理函数
  const handleCreateBot = async () => { ... };
  const handleEditBot = async () => { ... };
  // ... 更多函数

  // 内联组件
  const RobotCard = ({ robot }) => ( ... );

  return (
    // JSX
  );
};

// 3. 内联 Modal 组件
const CreateEditBotModal = ({ ... }) => {
  // 60+ 个 props
  // 复杂表单逻辑
};
```

**建议拆分**:
```
RobotManagePage/
├── index.jsx              # 主入口
├── RobotStats.jsx         # 统计面板
├── RobotFilterBar.jsx     # 过滤栏
├── RobotCard.jsx          # Bot 卡片
├── CreateEditModal.jsx    # 创建/编辑弹窗
├── DeleteConfirmModal.jsx # 删除确认
├── OneApiStatusBar.jsx    # One-API 状态
├── constants.js           # PROVIDER_CONFIG
└── hooks/
    └── useBotForm.js      # 表单状态 Hook
```

### 4.2.2 ChatPage.jsx (324行)

**当前问题**:
- 缺少 `useMemo` 优化
- 缺少 `useCallback` 优化
- 成员列表重复计算

**建议优化**:
```javascript
// 当前
const members = [
  { id: 'user', name: 'Current User', status: 'online', avatar: 'Me', color: 'bg-blue-500' },
  ...agentList.map(a => ({ ...a, color: a.color || 'bg-gray-400' }))
];

// 优化后
const members = useMemo(() => [
  { id: 'user', name: 'Current User', status: 'online', avatar: 'Me', color: 'bg-blue-500' },
  ...agentList.map(a => ({ ...a, color: a.color || 'bg-gray-400' }))
], [agentList]);
```

## 4.3 状态管理现状

**当前方式**: 组件内部 useState，无全局状态管理

**问题**:
- Agent 列表在多个页面重复获取
- 无法共享状态
- 缺少状态同步机制

**建议**:
```javascript
// contexts/AgentContext.jsx
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

## 4.4 API 服务层

**文件**: `src/services/api.js`

**当前问题**:
- 无统一的错误处理
- 无请求/响应拦截器
- 无超时配置

**建议重构**:
```javascript
// apiClient.js
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

## 4.5 WebSocket 连接管理

**当前方式**:
```javascript
// api.js
const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling']
});
```

**问题**:
- 无显式心跳机制
- 无断线重连提示
- 无连接状态监控

**建议**:
```javascript
// hooks/useSocketStatus.js
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

## 4.6 性能优化建议

| 组件 | 问题 | 解决方案 |
|------|------|----------|
| ChatPage | members 重复计算 | useMemo |
| ChatPage | handleSendMessage 重复创建 | useCallback |
| ChatSidebar | 无 memo | React.memo |
| LogPage | filteredLogs 重复计算 | useMemo |
| RobotManagePage | 组件过大 | 拆分重构 |
