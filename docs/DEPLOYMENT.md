# 🚀 部署指南 - 阿里云 ECS

## 一、前置准备

### 1. 购买 ECS
- 规格: ecs.c6.large (2vCPU 4GB)
- 系统: Ubuntu 22.04 LTS
- 地域: 华东1（杭州）或华北2（北京）
- 带宽: 3-5 Mbps

### 2. 配置安全组
开放端口:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

### 3. 准备域名（可选）
- 在阿里云购买域名
- 备案（国内服务器必须）
- 解析到 ECS 公网 IP

---

## 二、服务器初始化

### 方式一：一键脚本
```bash
# SSH 登录服务器
ssh root@<ECS_IP>

# 运行初始化脚本
curl -fsSL https://your-domain/setup-ecs.sh | bash
```

### 方式二：手动执行
```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. 安装 PM2
npm install -g pm2
pm2 startup systemd

# 4. 安装 Nginx
apt install -y nginx

# 5. 安装 Docker
curl -fsSL https://get.docker.com | bash

# 6. 配置防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 三、首次部署

### 1. 上传代码
```bash
# 在本地
scp -r 02_Development root@<ECS_IP>:/opt/chat-system

# 或者 Git Clone
ssh root@<ECS_IP>
cd /opt
git clone https://github.com/YOUR_USERNAME/chat-system.git
```

### 2. 配置环境变量
```bash
cd /opt/chat-system/backend
cp .env.example .env
vim .env  # 填入实际配置
```

### 3. 启动 One-API (Docker)
```bash
cd /opt/chat-system
docker-compose up -d one-api

# 查看初始 Token
docker logs openclaw-one-api | grep "root token"
```

### 4. 启动后端
```bash
cd /opt/chat-system/backend
npm install --production
pm2 start src/server.js --name chat-backend
pm2 save
```

### 5. 构建并部署前端
```bash
cd /opt/chat-system/frontend
npm install
npm run build
cp -r dist/* /var/www/chat-system/
```

### 6. 配置 Nginx
```bash
# 复制配置
cp scripts/nginx.conf /etc/nginx/sites-available/chat-system
ln -s /etc/nginx/sites-available/chat-system /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 7. 验证部署
```bash
# 检查服务状态
pm2 status
systemctl status nginx
docker ps

# 测试 API
curl http://localhost:3001/api/health
```

---

## 四、配置 HTTPS (推荐)

### 使用 Let's Encrypt
```bash
# 安装 certbot
apt install -y certbot python3-certbot-nginx

# 自动配置 SSL
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 五、配置 Git 自动部署

### 1. 生成 SSH 密钥
```bash
# 在 ECS 上
ssh-keygen -t ed25519 -C "deploy@ecs"
cat ~/.ssh/id_ed25519.pub
# 添加到 GitHub Deploy Keys
```

### 2. 配置 GitHub Secrets
在 GitHub 仓库设置中添加:

| Secret | 值 |
|--------|-----|
| `ECS_HOST` | ECS 公网 IP |
| `ECS_USER` | root |
| `ECS_SSH_KEY` | ECS SSH 私钥内容 |
| `API_BASE_URL` | https://your-domain.com |

### 3. 启用 GitHub Actions
- 推送代码到 main 分支
- GitHub Actions 自动触发部署
- 查看部署日志

---

## 六、日常运维

### 查看日志
```bash
# 后端日志
pm2 logs chat-backend

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 重启服务
```bash
# 重启后端
pm2 restart chat-backend

# 重启 Nginx
systemctl restart nginx

# 重启 One-API
docker restart openclaw-one-api
```

### 更新代码
```bash
# 手动更新
cd /opt/chat-system
git pull origin main
./scripts/deploy.sh

# 或直接推送代码，GitHub Actions 自动部署
```

---

## 七、监控告警

### PM2 监控
```bash
# 安装 pm2-logrotate
pm2 install pm2-logrotate

# 设置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 阿里云监控
- 开启 ECS 基础监控
- 配置 CPU/内存告警
- 设置磁盘空间告警

---

## 八、备份策略

### 数据库备份
```bash
# 每日备份脚本
cat > /opt/scripts/backup.sh << 'BAK'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /opt/backups/chat-$DATE.tar.gz /opt/chat-system/backend/data/
# 保留最近 7 天
find /opt/backups -name "chat-*.tar.gz" -mtime +7 -delete
BAK

chmod +x /opt/scripts/backup.sh

# 添加到 crontab
echo "0 2 * * * /opt/scripts/backup.sh" | crontab -
```

---

## 九、故障排查

### 后端无法启动
```bash
pm2 logs chat-backend --lines 100
```

### Nginx 502
```bash
# 检查后端是否运行
pm2 status

# 检查端口
netstat -tlnp | grep 3001
```

### WebSocket 连接失败
```bash
# 检查 Nginx 配置
nginx -t

# 检查防火墙
ufw status
```

---

## 十、成本优化

| 项目 | 月成本 |
|------|--------|
| ECS (2vCPU 4GB) | ¥100-150 |
| 带宽 (3Mbps) | ¥30-50 |
| 域名 (.com) | ¥60/年 |
| SSL 证书 | 免费 |
| **总计** | **¥150-200/月** |

### 节省技巧
- 使用抢占式实例（可省 50%+）
- 按流量计费带宽
- 开启自动释放

---

**部署完成后，访问 http://<ECS_IP> 或 https://your-domain.com 即可使用！**
