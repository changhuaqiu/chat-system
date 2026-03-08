# 1. 项目概述

## 1.1 项目背景

Chat-System 是一个企业级多机器人聊天系统，旨在提供统一的 LLM 接入层，支持多种大语言模型提供商和 Agent 框架。

## 1.2 核心功能

### 1.2.1 多 Bot 管理
- 支持多种 LLM 提供商：OpenAI、阿里通义千问、DeepSeek、Anthropic Claude
- 通过 One-API 网关统一管理 API Key 和配额
- Bot 在线状态管理和心跳检测

### 1.2.2 实时聊天
- WebSocket 实时双向通信
- 多房间支持
- @提及触发机制
- Bot 自动回复（自由模式/提及模式）

### 1.2.3 角色卡系统 (Character Cards)
- 基于 SillyTavern 规范的角色卡
- 支持人格设定、示例对话、说话风格
- YAML/JSON 格式加载

### 1.2.4 World Info
- 动态上下文注入
- 基于关键词触发
- 支持优先级和粘性设置

### 1.2.5 OpenClaw 集成
- 与 OpenClaw Gateway 对接
- Agent Session 管理
- 消息路由分发

## 1.3 用户角色

| 角色 | 描述 |
|------|------|
| 用户 | 发送消息，与 Bot 交互 |
| Bot | 响应用户消息，可被 @提及 |
| Agent | OpenClaw 托管的智能体 |
| 管理员 | 管理 Bot、API Key、配额 |

## 1.4 部署环境

### 开发环境
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
One-API: http://localhost:3002
OpenClaw: http://localhost:8000
```

### 生产环境
- Docker 容器化部署
- 环境变量配置
- 支持水平扩展（需要状态外置）

## 1.5 当前版本状态

### 已完成功能
- ✅ 核心 Bot 管理功能
- ✅ WebSocket 实时通信
- ✅ One-API 集成
- ✅ 角色卡系统
- ✅ World Info 功能
- ✅ 配额管理

### 待完善功能
- ⏳ OpenClaw Gateway 完整集成
- ⏳ 用户认证系统
- ⏳ 消息历史优化
- ⏳ 性能优化
