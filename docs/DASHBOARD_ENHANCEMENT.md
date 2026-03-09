# 仪表盘功能增强 - 开发文档

## 概述

本次更新增强了 DashboardPage 的功能，提升了数据可视化能力和实时性。

## 技术选型

| 决策项 | 选择 |
|--------|------|
| 图表库 | Recharts |
| 实时性方案 | 轮询刷新（30秒间隔） |
| 数据库驱动 | better-sqlite3（替代 sqlite3） |

## 更改摘要

### 1. 数据库层

#### 替换 sqlite3 为 better-sqlite3

**原因**：
- sqlite3 在 Node.js v24 上缺少预编译二进制文件
- better-sqlite3 有更好的 Windows 预编译支持
- better-sqlite3 是同步 API，更简单易用

**更改文件**：
- `backend/package.json` - 替换依赖
- `backend/src/db.js` - 更新为 better-sqlite3 API
- `backend/src/server.js` - 更新数据库操作
- `backend/src/routes/*.js` - 更新所有路由的数据库操作
- `backend/src/services/*.js` - 更新所有服务的数据库操作
- `backend/src/controllers/*.js` - 更新所有控制器的数据库操作
- `backend/migrations/*.js` - 更新迁移文件

#### 新增表：dashboard_stats

```sql
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE NOT NULL UNIQUE,
  total_messages INTEGER DEFAULT 0,
  total_agents INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  new_messages INTEGER DEFAULT 0,
  new_agents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 后端 API

#### 新增端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/stats/dashboard` | GET | 仪表盘概览统计 |
| `/api/stats/trend` | GET | 消息趋势数据（支持 ?days=7 参数） |
| `/api/stats/agents/performance` | GET | Agent 性能排行（支持 ?limit=10 参数） |
| `/api/stats/api-usage` | GET | API 使用统计（支持 ?days=7 参数） |

#### API 响应示例

**GET /api/stats/dashboard**
```json
{
  "overview": {
    "totalAgents": 10,
    "activeAgents": 5,
    "onlineRate": 50,
    "newAgentsThisWeek": 2
  },
  "messages": {
    "total": 1000,
    "today": 50,
    "todayGrowth": 12,
    "week": 350,
    "weekGrowth": 5
  },
  "api": {
    "totalCalls": 5000,
    "avgLatency": 250
  }
}
```

**GET /api/stats/trend?days=7**
```json
{
  "data": [
    { "date": "3/1", "fullDate": "2026-03-01", "messages": 120, "botResponses": 80 },
    { "date": "3/2", "fullDate": "2026-03-02", "messages": 150, "botResponses": 100 }
  ],
  "period": "7 days"
}
```

**GET /api/stats/agents/performance**
```json
{
  "data": [
    {
      "id": "bot-1",
      "name": "Assistant",
      "status": "online",
      "requestCount": 500,
      "totalTokens": 50000,
      "avgLatency": 200
    }
  ]
}
```

### 3. 前端组件

#### 新建组件

| 文件 | 描述 |
|------|------|
| `Dashboard/MessageTrendChart.jsx` | 消息趋势图表（AreaChart） |
| `Dashboard/AgentPerformancePanel.jsx` | Agent 性能面板（BarChart） |
| `Dashboard/ApiUsageChart.jsx` | API 使用统计（PieChart + BarChart） |
| `Dashboard/index.js` | 组件导出索引 |

#### 重构 DashboardPage.jsx

**新增功能**：
- 30 秒自动刷新（轮询）
- 搜索功能（Agent 名称模糊搜索）
- 接入 AgentContext（避免重复请求）
- 按钮跳转功能（新建智能体 → /admin，日志 → /logs，编辑 → /admin）
- 显示最后更新时间
- 动态统计数据（无硬编码）

### 4. 依赖更新

**前端**：
```json
{
  "recharts": "^3.8.0"
}
```

**后端**：
```json
{
  "better-sqlite3": "^11.0.0"  // 替代 sqlite3
}
```

## 安装与运行

### 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd frontend && npm install
```

### 运行迁移

```bash
cd backend && node migrations/run.js
```

### 启动服务

```bash
# 后端（端口 3001）
cd backend && npm start

# 前端（端口 5173）
cd frontend && npm run dev
```

### 访问仪表盘

打开浏览器访问：http://localhost:5173/dashboard

## 文件清单

### 新建文件

```
frontend/src/components/Dashboard/
├── MessageTrendChart.jsx
├── AgentPerformancePanel.jsx
├── ApiUsageChart.jsx
└── index.js

backend/migrations/
└── 007_add_dashboard_stats.js
```

### 修改文件

```
backend/
├── package.json                    # 替换 sqlite3 → better-sqlite3
├── src/db.js                       # 更新为 better-sqlite3 API
├── src/server.js                   # 更新数据库操作
├── src/routes/stats.js             # 新增 API 端点
├── src/routes/bots.js              # 更新数据库操作
├── src/routes/messages.js          # 更新数据库操作
├── src/routes/rooms.js             # 更新数据库操作
├── src/routes/logs.js              # 更新数据库操作
├── src/controllers/botController.js    # 更新数据库操作
├── src/controllers/apiKeyController.js # 更新数据库操作
├── src/services/botService.js      # 更新数据库操作
├── src/services/eventBus.js        # 更新数据库操作
├── src/services/loggerService.js   # 更新数据库操作
├── src/services/QuotaService.js    # 更新数据库操作
├── src/services/WorldInfoManager.js # 更新数据库操作
├── src/services/botRuntime.js      # 更新数据库操作
├── src/services/OneApiService.js   # 更新数据库操作
├── migrations/run.js               # 更新为 better-sqlite3 API
├── migrations/005_add_world_info.js # 更新迁移
└── migrations/006_add_messages_indexes.js # 更新迁移

frontend/
├── package.json                    # 新增 recharts 依赖
├── src/services/api.js             # 新增 API 调用方法
└── src/pages/DashboardPage.jsx     # 重构仪表盘页面
```

## 验证清单

- [x] 后端依赖安装成功
- [x] 前端依赖安装成功
- [x] 数据库迁移完成
- [x] 后端服务启动成功
- [x] 前端服务启动成功
- [ ] 访问 /dashboard 页面显示正常
- [ ] 消息趋势图表渲染正常
- [ ] Agent 性能面板显示正常
- [ ] API 使用统计图表显示正常
- [ ] 搜索功能正常
- [ ] 30 秒自动刷新正常
- [ ] 按钮跳转功能正常

## 注意事项

1. **数据库迁移**：首次运行时，旧的迁移（001-004）会被标记为已执行但不会实际运行。基础表由 `initDb()` 创建。

2. **better-sqlite3 API 差异**：
   - 同步 API，无需 Promise 包装
   - `db.prepare(sql).run(params)` 返回 `{ changes, lastInsertRowid }`
   - `db.prepare(sql).get(params)` 返回单行或 undefined
   - `db.prepare(sql).all(params)` 返回数组
   - `db.exec(sql)` 执行多条 SQL（无参数）

3. **Node.js 版本**：better-sqlite3 支持 Node.js v24。

## 后续优化建议

1. 添加图表数据缓存
2. 实现 WebSocket 实时推送替代轮询
3. 添加图表导出功能
4. 支持自定义刷新间隔
5. 添加数据导出功能（CSV/JSON）
