# 技术文档索引

**更新时间**: 2026-03-08

本文档目录包含项目的核心技术文档，供开发团队成员查阅。

---

## 📚 核心文档

| 文档 | 文件 | 说明 | 目标读者 |
|------|------|------|----------|
| **项目概览** | `PROJECT.md` | 项目信息、需求、排期 | 所有人 |
| **架构设计** | `ARCHITECTURE.md` | 系统架构设计 | 后端开发 |
| **技术设计** | `TECH_DESIGN.md` | 技术方案和业界参考 | 后端开发 |
| **角色系统设计** | `CHARACTER_SYSTEM_DESIGN.md` | 角色卡、World Info、记忆系统、上下文压缩 | 全栈开发 |
| **需求文档** | `REQUIREMENTS.md` | 详细需求说明 | 产品经理、开发 |
| **设计指南** | `DESIGN_GUIDE.md` | UI/UX 设计规范 | 前端开发 |
| **项目进度** | `SUMMARY.md` | 项目进度总览 | 所有人 |

---

## 🗂️ 文档分类

### 项目管理

- `PROJECT.md` - 项目概览、需求、排期
- `SUMMARY.md` - 项目进度总览
- `WBS.md` - 工作分解结构
- `TASKS.md` - 任务清单

### 技术设计

- `ARCHITECTURE.md` - 系统架构
- `TECH_DESIGN.md` - 技术方案
- `CHARACTER_SYSTEM_DESIGN.md` - 角色系统增强设计

### 开发指南

- `../README.md` - 开发目录说明
- `../backend/README.md` - 后端开发指南
- `../frontend/README.md` - 前端开发指南
- `../bot-sdk/README.md` - 机器人 SDK 使用指南

### 部署运维

- `../04_Deployment/README.md` - 部署文档
- `../04_Deployment/scripts/` - 部署脚本

---

## 🚀 新开发者快速入门

### 1. 了解项目

1. 阅读 `PROJECT.md` 了解项目概况
2. 阅读 `ARCHITECTURE.md` 了解系统架构
3. 阅读 `../README.md` 了解开发环境

### 2. 搭建环境

```bash
# 后端
cd ../backend
npm install
npm start

# 前端
cd ../frontend
npm install
npm run dev
```

### 3. 开始开发

- 前端开发：参考 `../frontend/README.md`
- 后端开发：参考 `../backend/README.md`
- 机器人开发：参考 `../bot-sdk/README.md`

---

## 📝 文档规范

### 文档命名

- 使用大写字母和下划线：`CHARACTER_SYSTEM_DESIGN.md`
- 项目级文档在 docs 目录根目录
- 专项文档在子目录

### 文档结构

技术文档应包含：
- 文档编号和日期
- 设计状态
- 目录
- 核心目标
- 架构/模块设计
- 数据结构
- 关键文件清单
- 实施计划
- 验证计划

---

## 🔗 外部参考

- [SillyTavern GitHub](https://github.com/SillyTavern/SillyTavern)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Fastify 文档](https://www.fastify.io/)
- [React 文档](https://react.dev/)

---

**维护者**: 开发团队
**最后更新**: 2026-03-08
