# 多机器人聊天系统

## 项目信息

- **项目名称**: 多机器人聊天系统 (Multi-Bot Chat System)
- **创建时间**: 2026-03-03
- **来源群组**: oc_7c67a3a4814e100e92a4eea9a27afd95
- **负责人**: 邱哥
- **状态**: 🚀 进行中 (2026-03-06 重启)

## 需求概要

### 核心功能
- [x] 基础聊天功能
- [x] 表情包/图片发送
- [x] @提及功能
- [x] 机器人之间自由沟通
- [ ] 角色卡系统 (Phase 1.1)
- [ ] World Info 上下文注入 (Phase 1.2)
- [ ] 长期记忆集成 (Phase 2.1)
- [ ] 上下文压缩 (Phase 2.2)
- [ ] Skills 系统 (Phase 3)
- [ ] MCP 集成 (Phase 3)

### 技术要求
- **类型**: Web 应用
- **机器人数量**: 100+ 同时在线
- **LLM 接入**: 现有 API（OpenAI/Claude/DeepSeek 等）
- **部署环境**: Mac mini 本地运行

### 技术栈（暂定）
- 前端: React + Socket.io
- 后端: Node.js + Fastify
- 数据库: SQLite
- LLM SDK: @ai-sdk/ai

## 待确认问题

1. 机器人"自由沟通"的触发规则？
   - [ ] 定时自动发言
   - [ ] 关键词触发
   - [ ] 机器人互相 @ 对话

2. LLM API Key 管理
   - [ ] 统一管理
   - [ ] 每个机器人独立配置

3. 是否需要 Web 管理后台？
   - [ ] 需要
   - [ ] 不需要

## 排期预估

### 已完成阶段

| 阶段 | 内容 | 工期 | 状态 |
|------|------|------|------|
| Phase 0 | 基础架构 + 聊天功能 | 3 天 | ✅ 已完成 |

### 规划中阶段

| 阶段 | 内容 | 工期 | 状态 | 文档 |
|------|------|------|------|------|
| Phase 1.1 | 角色卡系统 | 2-3 天 | 待开始 | `docs/CHARACTER_SYSTEM_DESIGN.md` |
| Phase 1.2 | World Info | 1-2 天 | 待开始 | `docs/CHARACTER_SYSTEM_DESIGN.md` |
| Phase 2.1 | 长期记忆集成 | 2-3 天 | 待开始 | `docs/CHARACTER_SYSTEM_DESIGN.md` |
| Phase 2.2 | 上下文压缩 | 2-3 天 | 待开始 | `docs/CHARACTER_SYSTEM_DESIGN.md` |
| Phase 3 | Skills + MCP | 4-5 天 | 待开始 | `docs/CHARACTER_SYSTEM_DESIGN.md` |

## 项目文档索引

### 核心文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目概览 | `PROJECT.md` | 项目信息、需求、排期 |
| 架构设计 | `ARCHITECTURE.md` | 系统架构设计 |
| 技术设计 | `TECH_DESIGN.md` | 技术方案和业界参考 |
| 角色系统增强 | `docs/CHARACTER_SYSTEM_DESIGN.md` | 角色卡、World Info、记忆系统 |
| 需求文档 | `REQUIREMENTS.md` | 详细需求说明 |
| 设计指南 | `DESIGN_GUIDE.md` | UI/UX 设计规范 |

### 开发目录

```
oc_7c67a3a4814e100e92a4eea9a27afd95/
├── PROJECT.md                 # 项目概览（本文档）
├── ARCHITECTURE.md            # 架构设计
├── TECH_DESIGN.md             # 技术设计
├── docs/
│   └── CHARACTER_SYSTEM_DESIGN.md  # 角色系统增强计划
├── 02_Development/
│   ├── backend/               # 后端服务
│   ├── frontend/              # 前端界面
│   └── README.md              # 开发目录说明
└── ...
```

- 2026-03-03 22:45: 项目创建，需求收集

## 项目停止记录

- **停止时间**: 2026-03-06 13:13
- **停止原因**: 项目负责人决定停止开发
- **停止内容**: 
  - 所有开发任务（T-021 ~ T-027）已暂停
  - 后端服务（端口 3000）可选择性停止
  - 所有代码和工作成果已保留

- **项目状态**: 已停止，可随时恢复
- **最后更新**: 2026-03-06 13:15
- **更新人**: 主管 (zhuguan)

## 项目重启记录

- **重启时间**: 2026-03-06 21:40
- **重启原因**: 用户反馈聊天室功能过于单调，需要改进和丰富功能
- **重启内容**:
  - 重新分析聊天室功能需求
  - 改进现有单调的聊天功能
  - 设计更丰富的交互体验
- **项目状态**: 进行中，需求分析阶段
- **最后更新**: 2026-03-06 21:40
- **更新人**: 主管 (zhuguan)
