# UI 变更日志 (UI Changelog)

> 记录所有前端 UI 相关的变更历史，确保每次修改都有迹可循。

---

## 2026-03-10: 全像素风格 UI 改造

### 变更概述

将整个前端项目从赛博朋克/霓虹风格改造为复古 8-bit 游戏机风格（NES/FC 风格）。

### 设计决策

| 决策项 | 选择 |
|--------|------|
| 风格方向 | 复古 8-bit 游戏风 |
| 字体大小 | 放大 1.5-2 倍保证可读性 |
| 视觉特效 | 扫描线效果 + 像素闪烁/抖动 |

### 核心设计变更对照表

| 特征 | 改造前 | 改造后 |
|------|--------|--------|
| 圆角 | `rounded-2xl`, `rounded-xl`, `rounded-full` | 直角或 4px 硬边框 |
| 渐变背景 | `linear-gradient(135deg, ...)` | 纯色或像素图案 |
| 玻璃态 | `backdrop-filter: blur()`, `bg-white/5` | 不透明像素块 |
| 发光阴影 | `box-shadow: 0 0 20px rgba(...)` | 硬边偏移阴影 `4px 4px 0` |
| 字体 | 'Inter', sans-serif | Press Start 2P + VT323 |
| 动画 | 柔和过渡、发光脉冲 | 像素闪烁、逐帧动画 |
| 边框 | 1px 半透明边框 | 4px 硬边框 |

### 修改的文件列表

#### 基础设施 (4 文件)

| 文件 | 操作 | 说明 |
|------|------|------|
| `tailwind.config.js` | 重写 | 8-bit 调色板、像素字体、硬边阴影配置 |
| `src/styles/pixel_theme.css` | 新建 | 像素主题样式，替代 cyber_theme.css |
| `src/styles/cyber_theme.css` | 删除 | 移除旧的赛博朋克主题 |
| `src/styles/animations.css` | 改造 | 像素闪烁、抖动、按钮按下效果 |
| `src/index.css` | 修改 | 字体导入、全局样式 |

#### 核心布局组件 (4 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Layout.jsx` | 像素图案背景、扫描线效果容器 |
| `src/components/Sidebar.jsx` | 像素风格导航、硬边框按钮 |
| `src/components/Chat/ChatSidebar.jsx` | 像素风格聊天室列表 |
| `src/components/Chat/MemberSidebar.jsx` | 像素风格成员列表 |

#### 聊天核心组件 (5 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Chat/ChatArea.jsx` | 像素风格聊天区域 |
| `src/components/Message/MessageBubble.jsx` | 像素风格消息气泡 |
| `src/components/Message/TextMessage.jsx` | 像素风格文本消息 |
| `src/components/Message/CodeMessage.jsx` | 像素风格代码块 |
| `src/components/BotAvatar.jsx` | 像素风格头像 |

#### 消息组件 (4 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Message/SystemMessage.jsx` | 系统消息改为像素硬边框 |
| `src/components/Message/FileMessage.jsx` | 文件消息卡片改为像素风格 |
| `src/components/Message/ImageMessage.jsx` | 图片消息及灯箱改为像素风格 |

#### 协作模式组件 (6 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Collaboration/WarRoomView.jsx` | 任务进度条、角色分配面板 |
| `src/components/Collaboration/ChatRoomView.jsx` | 话题标签、上下文面板 |
| `src/components/Collaboration/PanelView.jsx` | 专家投票面板、决策进度条 |
| `src/components/Collaboration/StandaloneView.jsx` | 简洁一对一界面 |
| `src/components/Collaboration/TaskBoard.jsx` | 任务看板（拖拽卡片、列） |
| `src/components/Collaboration/CollaborationIndicator.jsx` | 协作状态指示器 |
| `src/components/Collaboration/ModeSelector.jsx` | 模式选择器卡片 |

#### 上下文组件 (5 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Context/ContextHierarchy.jsx` | 上下文层级指示器 |
| `src/components/Context/ContextPreview.jsx` | 上下文预览模态框 |
| `src/components/Context/GlobalMemoryPanel.jsx` | 全局记忆面板 |
| `src/components/Context/RoomContextPanel.jsx` | 房间上下文面板 |
| `src/components/Context/BlackboardView.jsx` | 协作黑板组件 |

#### 页面组件 (8 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/pages/DashboardPage.jsx` | 统计卡片、图表容器 |
| `src/pages/LogPage.jsx` | 日志页面 |
| `src/pages/ApiKeysPage.jsx` | API 密钥页面 |
| `src/pages/CharacterCardLibrary.jsx` | 角色卡库 |
| `src/pages/CreateChatroomPage.jsx` | 创建聊天室 |
| `src/pages/ChatPage.jsx` | 聊天页面加载动画 |
| `src/pages/RobotManagePage/index.jsx` | 机器人管理主页 |
| `src/pages/RobotManagePage/RobotCard.jsx` | 机器人卡片 |
| `src/pages/RobotManagePage/RobotStats.jsx` | 机器人统计 |
| `src/pages/RobotManagePage/RobotFilterBar.jsx` | 筛选栏 |
| `src/pages/RobotManagePage/OneApiStatusBar.jsx` | API 状态栏 |
| `src/pages/RobotManagePage/CreateEditModal.jsx` | 创建/编辑模态框 |
| `src/pages/RobotManagePage/DeleteConfirmModal.jsx` | 删除确认模态框 |

#### 图表组件 (3 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/Dashboard/MessageTrendChart.jsx` | 消息趋势图表 |
| `src/components/Dashboard/AgentPerformancePanel.jsx` | Agent 性能面板 |
| `src/components/Dashboard/ApiUsageChart.jsx` | API 使用图表 |

#### 其他组件 (7 文件)

| 文件 | 修改内容 |
|------|---------|
| `src/components/EmojiPicker.jsx` | 表情选择器 |
| `src/components/AgentList.jsx` | Agent 列表 |
| `src/components/Chat/InviteModal.jsx` | 邀请模态框 |
| `src/components/Chat/SmartMentionPicker.jsx` | @提及选择器 |
| `src/components/WorldInfo/WorldInfoManager.jsx` | World Info 管理 |
| `src/components/CharacterCard/CharacterCardPreview.jsx` | 角色卡预览 |
| `src/components/CharacterCard/DraggableCard.jsx` | 可拖拽角色卡 |

### 8-bit 调色板

```css
/* 基础色 */
--pixel-black: #000000;
--pixel-dark: #1a1a2e;
--pixel-gray-dark: #374151;
--pixel-gray: #6b7280;
--pixel-white: #ffffff;

/* 强调色 */
--pixel-primary: #6366f1;      /* 靛蓝 */
--pixel-accent-cyan: #00f3ff;
--pixel-accent-green: #00ff88;
--pixel-accent-pink: #f43f5e;
--pixel-accent-orange: #f97316;
--pixel-accent-purple: #bc13fe;

/* 背景层次 */
--pixel-bg-primary: #0f0f23;
--pixel-bg-secondary: #1a1a2e;
--pixel-bg-card: #12121f;

/* 边框色 */
--pixel-border: #374151;
--pixel-border-light: #4b5563;
--pixel-border-highlight: #6366f1;
```

### 像素阴影系统

```css
--shadow-pixel-sm: 2px 2px 0 var(--pixel-border);
--shadow-pixel-md: 4px 4px 0 var(--pixel-border);
--shadow-pixel-lg: 6px 6px 0 var(--pixel-border);
--shadow-pixel-xl: 8px 8px 0 var(--pixel-border);
```

### 字体配置

```css
/* 标题使用 Press Start 2P */
.font-pixel-title {
  font-family: 'Press Start 2P', monospace;
}

/* 正文使用 VT323 */
.font-pixel-body {
  font-family: 'VT323', monospace;
}
```

### Git 提交信息

```
commit 5faddc8
style: 全像素风格 UI 改造

将整个前端项目改造为复古 8-bit 游戏机风格
52 files changed, 2445 insertions(+), 1936 deletions(-)
```

### 验证步骤

```bash
cd frontend && npm install && npm run dev
```

检查项：
- [x] 像素字体正确加载
- [x] 所有圆角已替换为硬边框
- [x] 硬边阴影生效
- [x] 扫描线效果可选启用
- [x] 8-bit 配色正确显示

---

## 变更记录模板

后续所有 UI 变更请按以下格式记录：

```markdown
## YYYY-MM-DD: [变更标题]

### 变更概述
[简要描述本次变更的目的和范围]

### 修改的文件
| 文件 | 操作 | 说明 |
|------|------|------|
| ... | ... | ... |

### 变更详情
[详细的变更内容描述]

### 验证步骤
[如何验证本次变更]

### Git 提交
- Commit: [hash]
- Branch: [branch-name]
```

---

**文档维护**: 每次前端 UI 相关变更都必须更新此文档
**最后更新**: 2026-03-10
