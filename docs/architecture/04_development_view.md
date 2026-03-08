# 4. 开发视图 (Development View)

开发视图展示了软件模块的组织方式、代码结构以及开发环境的配置，旨在帮助开发人员理解系统的物理文件布局和模块划分。

## 4.1 目录结构

OpenClaw 项目采用 Monorepo 风格的目录结构，分为前端和后端两个主要模块，便于统一管理和部署。

*   **02_Development/** (项目根目录)
    *   **backend/** (Node.js 服务端)
        *   `src/server.js`: 应用程序入口，负责初始化 Fastify、Socket.IO 和数据库连接。
        *   `src/adaptors/`: 机器人适配器实现，包含 `LlmAdaptor` (OpenAI), `CliAdaptor` (本地命令), `WebhookAdaptor` (外部服务)。
        *   `src/services/`: 核心业务逻辑，包括 `BotService` (任务调度), `EventBus` (消息分发), `LoggerService` (日志)。
        *   `src/routes/`: API 路由定义，按功能模块划分 (`bots`, `messages`, `rooms`, `logs`)。
        *   `src/controllers/`: 请求处理逻辑，如 `ApiKeyController`。
        *   `src/db.js`: 数据库连接与表结构初始化 (SQLite)。
        *   `package.json`: 后端依赖配置。
    *   **frontend/** (React 客户端)
        *   `src/pages/`: 页面组件，如 `ChatPage` (聊天室), `DashboardPage` (仪表盘), `RobotManagePage` (机器人管理)。
        *   `src/components/`: 可复用 UI 组件，如 `ChatSidebar`, `MessageBubble`, `BotCard`。
        *   `src/services/`: API 客户端 (`api.js`) 与 Socket 封装，负责前后端通信。
        *   `src/context/`: 全局状态管理 (Context API)。
        *   `vite.config.js`: 前端构建配置。
        *   `tailwind.config.js`: 样式配置。
    *   `docs/`: 项目文档，包括架构设计 (`architecture/`) 和进度报告 (`PROGRESS.md`)。

## 4.2 技术栈

### 后端 (Backend)

*   **Runtime**: Node.js (v18+)
*   **Web Framework**: Fastify (高性能 Web 框架)
*   **Real-time**: Socket.IO (WebSocket 通信)
*   **Database**: SQLite (sqlite3) - 轻量级嵌入式数据库
*   **HTTP Client**: Axios (用于调用 LLM API)
*   **Process Management**: PM2 (生产环境进程守护)

### 前端 (Frontend)

*   **Library**: React (v18)
*   **Build Tool**: Vite (极速开发与构建)
*   **Styling**: Tailwind CSS (实用优先 CSS 框架)
*   **Routing**: React Router (SPA 路由)
*   **Icons**: Emoji (系统自带) / SVG

## 4.3 模块划分与依赖关系

系统的模块划分遵循高内聚、低耦合原则：

*   **API Layer** (`src/routes/`) 依赖 **Service Layer** (`src/services/`) 和 **Data Layer** (`src/db.js`)。
*   **Service Layer** (`BotService`) 依赖 **Core Layer** (`BotRuntime`) 和 **EventBus**。
*   **Core Layer** (`BotRuntime`) 依赖 **Adaptor Layer** (`src/adaptors/`)。
*   **Adaptor Layer** 依赖外部 API (`axios`) 或系统调用 (`child_process`)。

前端通过 `src/services/api.js` 封装所有的 HTTP 请求和 Socket 事件，使得 UI 组件 (`src/pages/`, `src/components/`) 不直接依赖具体的通信细节，便于维护和测试。

## 4.4 开发规范

*   **代码风格**: 遵循 ESLint 推荐规范。
*   **命名约定**:
    *   文件/目录: 小写 kebab-case (如 `bot-service.js`) 或 camelCase (如 `BotService.js`，视团队习惯而定，当前为 camelCase)。
    *   类名: PascalCase (如 `BotService`)。
    *   变量/函数: camelCase (如 `processQueue`)。
    *   常量: SCREAMING_SNAKE_CASE (如 `MAX_CONCURRENT`)。
*   **版本控制**: Git，主分支为 `main`，开发分支为 `develop`。

---

**设计决策说明**:
*   **为什么选择 Fastify?** 相比 Express，Fastify 提供了更高的性能和更好的插件系统，且原生支持 schema 验证。
*   **为什么选择 SQLite?** 项目定位为单机或小规模部署，SQLite 无需独立服务进程，部署简单，且足以支撑数万条消息的存储。
*   **为什么选择 Vite?** 相比 Webpack，Vite 提供了秒级的冷启动和热更新体验，极大提升了开发效率。
