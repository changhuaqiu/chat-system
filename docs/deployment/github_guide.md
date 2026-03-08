# GitHub 私有仓库自动化部署指南

本指南将帮助你将 OpenClaw 项目托管到 GitHub 私有仓库，并配置 GitHub Actions 实现代码推送到 `main` 分支后自动部署到 EC2 服务器。

## 1. 准备 GitHub 仓库

1.  登录 GitHub，点击右上角 `+` -> **New repository**。
2.  输入仓库名称 (例如 `openclaw-private`)。
3.  **重要**: 选择 **Private** (私有)。
4.  点击 **Create repository**。

## 2. 推送代码

在你的本地项目根目录 (`02_Development`) 执行以下命令：

```bash
# 如果还没有初始化 git
git init
git add .
git commit -m "Initial commit"

# 关联远程仓库 (替换 <YOUR_USERNAME> 为你的 GitHub 用户名)
git remote add origin https://github.com/<YOUR_USERNAME>/openclaw-private.git

# 推送代码
git branch -M main
git push -u origin main
```

## 3. 准备 EC2 服务器

登录你的 EC2 服务器，执行以下操作：

1.  **安装 Docker**:
    ```bash
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    # 退出重登生效
    ```

2.  **创建部署目录**:
    ```bash
    sudo mkdir -p /opt/openclaw
    sudo chown $USER:$USER /opt/openclaw
    ```

3.  **上传 `docker-compose.yml`**:
    你可以手动将项目中的 `docker-compose.yml` 复制到服务器的 `/opt/openclaw/docker-compose.yml`，或者在 GitHub Action 中添加步骤自动 scp 过去。
    *建议*: 初次部署手动复制一次即可，或者在服务器上 `git clone` 你的仓库（需要配置 SSH Key）。

## 4. 配置 GitHub Secrets

为了让 GitHub Actions 能登录你的服务器并拉取镜像，需要配置 Secrets。

1.  进入 GitHub 仓库 -> **Settings** -> **Secrets and variables** -> **Actions**。
2.  点击 **New repository secret**，添加以下变量：

| Secret Name | 值说明 |
| :--- | :--- |
| `EC2_HOST` | EC2 的公网 IP 地址 |
| `EC2_USER` | 登录用户名 (如 `ubuntu` 或 `ec2-user`) |
| `EC2_SSH_KEY` | EC2 的私钥内容 (打开 `.pem` 文件复制全部内容) |
| `ONE_API_BASE_URL` | One API 的地址 (如 `http://<ONE_API_IP>:3000`) |
| `JWT_SECRET` | 随机生成的 JWT 密钥 |

## 5. 验证部署

1.  修改本地代码 (例如修改 `README.md`)。
2.  提交并推送: `git commit -am "Test deploy" && git push`。
3.  去 GitHub 仓库的 **Actions** 标签页查看流水线运行状态。
4.  如果成功，访问 `http://<EC2_IP>` 即可看到 OpenClaw 运行界面。
