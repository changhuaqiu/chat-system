# 轻量级云端自动化部署计划 (EC2 双机模式)

## 目标
针对两台 EC2 主机的场景（一台已部署 One API，另一台部署 OpenClaw），设计一套轻量级、自动化的 CI/CD 部署方案。重点在于简化配置，利用 GitHub Actions 实现代码推送后的自动更新。

## 部署架构
*   **Server A (现有)**: 运行 One API。
*   **Server B (OpenClaw App Server)**: 
    *   运行 OpenClaw Backend (Node.js)。
    *   运行 Python Worker (可选，如果需要)。
    *   运行 Nginx (反向代理 + 前端静态资源托管)。
    *   运行 SQLite (本地文件存储)。

## 自动化方案选择
为了兼顾“简单”与“稳定”，推荐使用 **GitHub Actions 构建镜像 -> 推送 GHCR -> 服务器拉取** 的模式。
*理由*: 避免在 EC2 上执行 `npm install` 和 `npm run build` 消耗大量 CPU/内存导致死机，同时部署速度更快。

## 执行步骤

1.  **应用配置改造**
    - [ ] **One API 对接**: 确认 Backend 支持通过环境变量 `ONE_API_BASE_URL` 连接 Server A 的 One API 地址。
    - [ ] **Docker 化**:
        - 编写 `Dockerfile`: 采用多阶段构建，Stage 1 构建 React 前端，Stage 2 构建 Node.js 后端并集成前端静态文件 (或分离 Nginx)。
        - 编写 `Dockerfile.worker`: Python 环境。

2.  **服务编排 (Server B)**
    - [ ] 编写 `docker-compose.yml`:
        - 定义 `app` (OpenClaw), `worker` (Python), `nginx` 服务。
        - 配置 `restart: always`。
        - 挂载 SQLite 数据卷 `./data:/app/data`。
        - 配置环境变量指向 Server A (`ONE_API_BASE_URL=http://<Server-A-IP>:3000`).

3.  **CI/CD 流水线 (.github/workflows/deploy.yml)**
    - [ ] **构建阶段**: 
        - 监听 `main` 分支 push。
        - 登录 GitHub Container Registry (GHCR)。
        - 构建并推送镜像 `ghcr.io/username/openclaw:latest`。
    - [ ] **部署阶段**:
        - 使用 `appleboy/ssh-action` 连接 Server B。
        - 执行命令: `docker compose pull && docker compose up -d`。

4.  **Nginx 配置**
    - [ ] 编写 `nginx.conf`:
        - 转发 `/api` -> Backend:3000。
        - 转发 `/socket.io` -> Backend:3000 (支持 WebSocket)。
        - 静态资源 -> 前端构建产物。

5.  **文档产出**
    - [ ] `docs/deployment/ec2_deploy_guide.md`: 包含服务器初始化命令、Secrets 配置清单。

## 交付物清单
*   `Dockerfile`
*   `docker-compose.yml`
*   `.github/workflows/deploy.yml`
*   `nginx/default.conf`
*   `docs/deployment/ec2_deploy_guide.md`
