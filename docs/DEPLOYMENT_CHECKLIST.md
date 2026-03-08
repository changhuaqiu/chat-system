# 📋 部署清单

## 预部署 (本地)

- [ ] 创建 GitHub 仓库
- [ ] 推送代码到 GitHub
- [ ] 准备域名（可选）

## ECS 购买

- [ ] 购买 ECS (2vCPU 4GB, Ubuntu 22.04)
- [ ] 配置安全组 (22, 80, 443)
- [ ] 获取公网 IP

## 服务器初始化

- [ ] SSH 登录
- [ ] 运行 `scripts/setup-ecs.sh`
- [ ] 配置 SSH 密钥免密登录

## 首次部署

- [ ] Clone 代码到 `/opt/chat-system`
- [ ] 配置 `backend/.env`
- [ ] 启动 One-API: `docker-compose up -d one-api`
- [ ] 启动后端: `pm2 start src/server.js --name chat-backend`
- [ ] 构建前端: `npm run build`
- [ ] 复制到 Nginx: `cp -r dist/* /var/www/chat-system/`
- [ ] 配置 Nginx: `cp scripts/nginx.conf /etc/nginx/sites-available/`
- [ ] 测试访问: `curl http://localhost`

## HTTPS 配置

- [ ] 域名解析到 ECS IP
- [ ] 运行 `certbot --nginx -d your-domain.com`
- [ ] 测试 HTTPS 访问

## 自动化部署

- [ ] 生成 ECS SSH 密钥
- [ ] 添加 GitHub Deploy Key
- [ ] 配置 GitHub Secrets
- [ ] 推送代码测试自动部署

## 验证

- [ ] 前端页面可访问
- [ ] API 正常响应
- [ ] WebSocket 连接正常
- [ ] HTTPS 证书有效

## 监控

- [ ] 配置日志轮转
- [ ] 设置阿里云监控告警
- [ ] 配置数据库备份

---

**完成！** 🎉
