# 设计指引 (Design Guide)

> 🎨 **当前设计版本**: Apple Style (苹果风格)
> 📅 **最后更新**: 2026-03-07
> ✅ **状态**: 已确定，准备开发

---

## 📌 快速索引：当前设计文件

| 页面 | 当前文件 | 说明 |
|------|----------|------|
| 📊 仪表盘 | `01_Design/dashboard_global_overview.html` | 全局概览，趋势统计 |
| 🤖 Agent管理 | `01_Design/robot_management_apple.html` | Agent CRUD，添加向导 |
| 📈 数据分析 | `01_Design/analytics_dashboard.html` | 使用统计，性能监控 |
| 🔑 API Key管理 | `01_Design/api_key_management_apple.html` | API Key管理 |
| 📋 日志管理 | `01_Design/logs_management_apple.html` | 系统日志查看 |
| 💬 聊天室 | `01_Design/chat_interface_enhanced.html` | 聊天界面，增强功能 |

---

## 📖 详细文档

### 用户旅程
- 完整文档: `00_Analysis/user_journey.md`
- 包含页面流转、功能说明、开发优先级

### 需求分析
- 聊天室增强: `00_Analysis/chatroom_enhancement_analysis.md`
- 多Agent集成: `00_Analysis/multi_agent_integration_analysis.md`

### 信息架构
- 架构设计: `00_Analysis/information_architecture_redesign.md`
- 解决页面重复问题，明确各页面职责

---

## 🔑 API Key 管理页面说明

### 功能模块
1. **顶部统计卡片**
   - 活跃Key、已撤销、本月调用
   
2. **Key列表**
   - 表格视图展示所有Key
   - 支持显示/隐藏Key、复制功能
   - 权限标签（读/写/删除）
   - 状态徽章（活跃/已撤销）

3. **创建Key向导**
   - Key名称、描述
   - 权限配置（复选框）
   - 创建后显示完整Key

4. **操作功能**
   - 编辑、撤销、删除
   - 搜索和筛选

---

## 🤖 Agent 管理页面说明

### 功能模块
1. **顶部统计卡片**
   - 总Agent、在线、忙碌、离线
   
2. **Agent列表**
   - 卡片视图展示
   - 状态指示器（绿点/红点/黄点）
   - 快捷操作：聊天、配置

3. **筛选功能**
   - 类型筛选、状态筛选
   - 搜索功能
   - 网格/列表视图切换

---

## 📋 日志管理页面说明

### 功能模块
1. **顶部统计卡片**
   - 总日志数、信息、警告、错误
   
2. **日志列表**
   - 时间顺序展示
   - 级别徽章（信息/警告/错误/成功）
   - 颜色区分不同级别

3. **筛选功能**
   - 级别筛选（全部/信息/警告/错误/成功）
   - Agent筛选
   - 时间范围筛选
   - 搜索功能

4. **操作功能**
   - 导出日志
   - 清空日志
   - 刷新
   - 分页

---

## 📈 数据分析页面说明

### 功能模块
1. **顶部统计卡片**
   - 总调用次数、活跃用户、平均响应、成功率
   - 显示周同比变化趋势

2. **趋势分析**
   - 7天调用趋势图
   - 24小时时间分布热力图
   - 高峰时段标注（14:00-16:00）

3. **Agent使用排行**
   - 带进度条的排行榜（前4名）
   - 显示调用次数和占比
   - 支持排序和筛选

4. **性能监控**
   - 平均响应时间（目标：<400ms）
   - 成功率（目标：>99%）
   - 并发处理（警告：>70%）
   - 错误率监控
   - 最近错误列表

5. **时间筛选**
   - 今天、过去7天、过去30天、自定义
   - 数据导出功能（CSV/Excel）

---

## 🎨 设计规范

### 颜色系统
- 主色: `#007aff` (苹果蓝)
- 成功: `#34c759` (苹果绿)
- 警告: `#ff9f0a` (苹果橙)
- 错误: `#ff3b30` (苹果红)
- 背景: `#f5f5f7` (苹果灰)
- 卡片: `#ffffff` (纯白)

### 圆角规范
- 卡片: 18px
- 按钮: 12px
- 输入框: 12px
- 图标: 14px

### 阴影规范
- 普通: `0 2px 8px rgba(0,0,0,0.04)`
- 悬停: `0 4px 20px rgba(0,0,0,0.08)`

### 字体规范
- 主要: `-apple-system, BlinkMacSystemFont, Inter`
- 标题: 18px - 32px, semibold
- 正文: 14px - 16px, regular
- 小字: 12px - 13px, regular
- 代码/日志: `SF Mono`, Monaco, `Cascadia Code`

---

## 🚀 开发优先级

### 第一阶段 (核心功能)
1. ✅ 仪表盘 (`dashboard_global_overview.html`)
2. ✅ Agent管理 (`robot_management_apple.html`)
3. ✅ API Key管理 (`api_key_management_apple.html`)
4. ✅ 日志管理 (`logs_management_apple.html`)

### 第二阶段 (基础功能)
5. 📈 数据分析 (`analytics_dashboard.html`)
6. 💬 聊天室基础功能 (`chat_interface_enhanced.html`)

### 第三阶段 (增强功能)
7. 聊天室主题切换
8. 表情包系统
9. 消息反应功能

---

## ⚠️ 注意事项

### ❌ 不要使用的文件
- `admin_dashboard_multi_agent.html` (v1, 颜色太鲜艳)
- `admin_dashboard_multi_agent_v2.html` (v2, 已过时)
- `admin_dashboard_apple_style.html` (v3, 有对齐问题)
- `api_key_management.html` (旧版，风格不统一)
- `robot_management.html` (旧版，风格不统一)

### ✅ 请使用的文件
- `dashboard_global_overview.html` (仪表盘)
- `robot_management_apple.html` (Agent管理)
- `api_key_management_apple.html` (API Key)
- `logs_management_apple.html` (日志)
- `analytics_dashboard.html` (数据分析)
- `chat_interface_enhanced.html` (聊天室)

---

## 📞 联系

如有设计问题，请联系 **UX Designer**

---
**最后更新**: 2026-03-07
**新增**: API Key管理、Agent管理、日志管理页面
**统一**: 所有页面已统一为Apple Style
