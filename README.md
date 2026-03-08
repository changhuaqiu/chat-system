# 多机器人聊天系统 - 开发目录

## 项目结构

```
02_Development/
├── backend/      # 后端服务
│   ├── src/
│   ├── package.json
│   └── README.md
├── frontend/     # 前端界面
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md     # 本文档
```

## 快速启动

### 1. 后端服务

```bash
cd backend
npm install
cp .env.example .env
npm start
```

### 2. 前端界面

```bash
cd frontend
npm install
npm run dev
```

## 开发流程

1. **启动后端**: 运行 `npm start` (后端目录)
2. **启动前端**: 运行 `npm run dev` (前端目录)
3. **访问界面**: http://localhost:5173

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Node.js + Fastify + Socket.IO |
| 前端 | React + Vite + Tailwind CSS |
| 数据库 | SQLite |
| LLM SDK | @ai-sdk/ai |

## 开发规范

- 代码遵循 ESLint 规范
- 组件使用函数式组件 + Hooks
- RESTful API 设计
- WebSocket 用于实时通信
- SQLite 用于本地数据存储

## 构建

```bash
# 后端构建（无需构建，直接运行）
cd backend
npm start

# 前端构建
cd frontend
npm run build
```

## 调试

```bash
# 后端调试
node --inspect src/server.js

# 前端调试
# Chrome 打开 http://localhost:5173，按 F12
```

---
*创建日期: 2026-03-03*
*版本: v1.0.0*
