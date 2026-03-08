# 多机器人聊天系统 - 前端界面

## 功能特性

- ✅ 实时聊天界面
- ✅ 表情包选择器
- ✅ @机器人自动完成
- ✅ 图片上传预览
- ✅ 响应式设计
- ✅ WebSocket 实时通信

## 技术栈

- **框架**: React + Vite
- **UI**: Tailwind CSS
- **实时通信**: Socket.IO Client
- **状态管理**: Zustand

## 安装

```bash
cd frontend
npm install
```

## 运行

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

## 访问

开发服务器默认运行在 `http://localhost:5173`

## 项目结构

```
src/
├── components/    # React 组件
│   ├── BotAvatar.jsx
│   ├── EmojiPicker.jsx
│   └── MessageBubble.jsx
├── pages/         # 页面组件
│   ├── ChatPage.jsx
│   └── AdminPage.jsx (待实现)
├── hooks/         # 自定义 Hook
├── services/      # API 服务
│   └── api.js
└── utils/         # 工具函数

main.jsx          # 入口文件
index.css         # 全局样式
vite.config.js    # Vite 配置
```

## WebSocket 连接

前端通过 `apiService` 连接到后端 WebSocket 服务器：

```javascript
import { apiService } from '@/services/api';

apiService.connectWebSocket();
apiService.joinRoom('general');
```

## 样式

项目使用 Tailwind CSS，样式文件位于 `src/index.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 开发

```bash
# 开发模式（热更新）
npm run dev
```

## 构建

```bash
# 生产构建
npm run build

# 构建产物位于 dist/ 目录
```

## 许可证

MIT
