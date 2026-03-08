# GitHub 私有仓库自动化部署计划 (Revised)

## 目标
1.  **Git 初始化**: 将项目根目录 `/Users/kk/.openclaw/workspace-projects/oc_7c67a3a4814e100e92a4eea9a27afd95/02_Development` 初始化为 Git 仓库。
2.  **推送到 GitHub 私有仓**: 协助用户将代码推送到 GitHub 私有仓库，实现代码托管。
3.  **配置 CI/CD**: 利用 GitHub Actions 自动化部署到 Server B (EC2)。

## 执行步骤

1.  **Git 配置与提交**
    - [ ] **初始化**: `cd 02_Development && git init`。
    - [ ] **配置忽略**: 创建 `.gitignore`，忽略 `node_modules`, `dist`, `logs`, `.env`, `data/*.db` 等。
    - [ ] **提交代码**: `git add . && git commit -m "Initial commit"`。

2.  **部署配置 (Docker + CI)**
    - [ ] **编写 `Dockerfile`**: 多阶段构建 (Node.js + React)。
    - [ ] **编写 `docker-compose.yml`**: 服务编排 (Backend, Nginx, SQLite)。
    - [ ] **编写 `nginx.conf`**: 反向代理配置。
    - [ ] **编写 `.github/workflows/deploy.yml`**: CI/CD 流程。

3.  **文档与指引**
    - [ ] **生成指引**: `docs/deployment/github_guide.md`，指导用户如何创建 GitHub 私有仓、如何关联 Remote、如何配置 Secrets。

## 交付物清单
*   `.gitignore`
*   `Dockerfile`
*   `docker-compose.yml`
*   `nginx/default.conf`
*   `.github/workflows/deploy.yml`
*   `docs/deployment/github_guide.md`
