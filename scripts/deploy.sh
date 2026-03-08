#!/bin/bash
# 部署脚本 - 在 ECS 上运行
# 用法: ./deploy.sh [branch]

set -e

BRANCH=${1:-main}
PROJECT_DIR="/opt/chat-system"
REPO_URL="https://github.com/YOUR_USERNAME/chat-system.git"  # 替换为你的仓库地址

echo "=========================================="
echo "  聊天室项目 - 部署脚本"
echo "  分支: $BRANCH"
echo "=========================================="

cd $PROJECT_DIR

# 1. 拉取最新代码
echo "[1/5] 拉取最新代码..."
if [ -d ".git" ]; then
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL .
fi

# 2. 安装后端依赖
echo "[2/5] 安装后端依赖..."
cd backend
npm install --production

# 3. 构建前端
echo "[3/5] 构建前端..."
cd ../frontend
npm install
npm run build

# 4. 复制前端文件到 Nginx
echo "[4/5] 部署前端文件..."
rm -rf /var/www/chat-system/*
cp -r dist/* /var/www/chat-system/

# 5. 重启后端服务
echo "[5/5] 重启后端服务..."
cd ../backend
pm2 delete chat-backend || true
pm2 start src/server.js --name chat-backend
pm2 save

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
pm2 status
