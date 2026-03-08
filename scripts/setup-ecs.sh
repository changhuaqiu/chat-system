#!/bin/bash
# 阿里云 ECS 初始化脚本
# 使用: curl -fsSL https://your-domain/setup.sh | bash

set -e

echo "=========================================="
echo "  聊天室项目 - ECS 初始化脚本"
echo "=========================================="

# 1. 系统更新
echo "[1/8] 系统更新..."
apt update && apt upgrade -y

# 2. 安装基础工具
echo "[2/8] 安装基础工具..."
apt install -y curl wget git htop vim ufw

# 3. 安装 Node.js 20
echo "[3/8] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# 4. 安装 PM2
echo "[4/8] 安装 PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 5. 安装 Nginx
echo "[5/8] 安装 Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 6. 安装 Docker
echo "[6/8] 安装 Docker..."
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# 7. 配置防火墙
echo "[7/8] 配置防火墙..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 8. 创建项目目录
echo "[8/8] 创建项目目录..."
mkdir -p /var/www/chat-system
mkdir -p /opt/chat-system
mkdir -p /opt/chat-system/data

# 创建部署用户
useradd -m -s /bin/bash deploy || true
chown -R deploy:deploy /opt/chat-system
chown -R deploy:deploy /var/www/chat-system

echo ""
echo "=========================================="
echo "  ✅ 初始化完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 配置 SSH 密钥: ssh-copy-id root@<ECS_IP>"
echo "2. 运行部署脚本: ./deploy.sh"
echo "3. 配置域名和 SSL"
echo ""
