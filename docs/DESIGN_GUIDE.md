# 设计指引 (Design Guide)

> 🎮 **当前设计版本**: Pixel Style (像素风格 - 8-bit 复古游戏机风格)
> 📅 **最后更新**: 2026-03-10
> ✅ **状态**: 已完成改造

> ⚠️ **重要变更**: 2026-03-10 已从 Apple Style 改造为 Pixel Style，详见 [UI_CHANGELOG.md](./UI_CHANGELOG.md)

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

## 🎨 设计规范 (Pixel Style)

### 颜色系统 (8-bit 调色板)

**基础色**
- 黑色: `#000000`
- 深色: `#1a1a2e`
- 灰色: `#6b7280`
- 白色: `#ffffff`

**强调色**
- 主色 (靛蓝): `#6366f1`
- 青色: `#00f3ff`
- 绿色: `#00ff88`
- 粉色: `#f43f5e`
- 橙色: `#f97316`
- 紫色: `#bc13fe`

**背景层次**
- 主背景: `#0f0f23`
- 次背景: `#1a1a2e`
- 卡片背景: `#12121f`

### 边框规范 (硬边框)
- 所有元素: `border-4` (4px 实线边框)
- 无圆角，或使用 `2px` 小圆角
- 边框色: `#374151` (默认) / `#4b5563` (高亮)

### 阴影规范 (硬边偏移)
- 小阴影: `2px 2px 0 var(--pixel-border)`
- 中阴影: `4px 4px 0 var(--pixel-border)`
- 大阴影: `6px 6px 0 var(--pixel-border)`
- 超大阴影: `8px 8px 0 var(--pixel-border)`

### 字体规范 (像素字体)
- 标题: `'Press Start 2P'`, monospace
- 正文: `'VT323'`, monospace
- 基础字号放大 1.5-2 倍保证可读性

### 动画规范 (像素风格)
- 像素闪烁: `pixel-flicker`
- 像素抖动: `pixel-shake`
- 按钮按下: 向右下偏移 2px

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

### 🎮 像素风格开发规范

1. **不要使用圆角** - 所有元素使用直角或 4px 硬边框
2. **不要使用渐变** - 使用纯色或像素图案背景
3. **不要使用模糊效果** - 移除 `backdrop-filter: blur()`
4. **不要使用发光阴影** - 使用硬边偏移阴影 `4px 4px 0`
5. **使用像素字体** - 标题用 `font-pixel-title`，正文用 `font-pixel-body`

### 样式类名参考

```css
/* 像素边框 */
border-4 border-border

/* 像素阴影 */
shadow-pixel-sm  /* 2px 2px 0 */
shadow-pixel-md  /* 4px 4px 0 */
shadow-pixel-lg  /* 6px 6px 0 */

/* 像素颜色 */
bg-bg-card          /* 卡片背景 */
bg-bg-secondary     /* 次背景 */
border-pixel-primary    /* 主色边框 */
text-pixel-accent-cyan  /* 青色文字 */
```

### 📁 相关文档

- [UI_CHANGELOG.md](./UI_CHANGELOG.md) - UI 变更历史记录
- [../frontend/src/styles/pixel_theme.css](../frontend/src/styles/pixel_theme.css) - 像素主题样式

---

## 📞 联系

如有设计问题，请联系 **UX Designer**

---
**最后更新**: 2026-03-10
**重大变更**: 从 Apple Style 改造为 Pixel Style (8-bit 复古游戏机风格)
**详细记录**: 见 [UI_CHANGELOG.md](./UI_CHANGELOG.md)
