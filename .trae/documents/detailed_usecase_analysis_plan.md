# 详细用例与场景分析计划 (Revised)

## 目标
根据用户反馈，大幅细化架构文档中的“场景视图”，并按照 4+1 视图模型将文档拆分为多个独立文件。

## 步骤

1.  **深入业务逻辑分析**
    - [ ] **聊天室场景分析**:
        - 检查 `CreateChatroomPage.jsx` 和后端 `rooms.js`，明确“自由模式 (Free)”与“专注模式 (@Only)”的具体实现差异。
        - 分析 `botService.js` 中的 `onMessageCreated` 逻辑，确认不同模式下机器人的触发条件（是否强制 @）。
    - [ ] **机器人管理场景分析**:
        - 检查 `RobotManagePage.jsx` 和 `botRuntime.js`。
        - 区分不同 Provider (OpenAI, Claude CLI, Webhook) 的配置字段差异和连接测试流程。
    - [ ] **消息流转与协作场景分析**:
        - 分析 Bot-to-Bot (A2A) 交互逻辑，包括循环检测机制 (`depth` check) 和触发链。
        - 分析多模态消息（图片上传 -> 发送 -> 展示）的处理流程。
    - [ ] **运维场景分析**:
        - 检查 `ApiKeysPage.jsx` 和 `LogPage.jsx`，挖掘除了基础展示之外的业务规则（如 Key 的额度逻辑、日志的过滤规则）。

2.  **重构架构文档 (按 4+1 视图拆分)**
    - [ ] **创建 `docs/architecture/` 目录结构**：
        - `docs/architecture/01_scenario_view.md` (场景视图)
        - `docs/architecture/02_logical_view.md` (逻辑视图)
        - `docs/architecture/03_process_view.md` (过程视图)
        - `docs/architecture/04_development_view.md` (开发视图)
        - `docs/architecture/05_physical_view.md` (物理视图)

    - [ ] **重写 `01_scenario_view.md` (场景视图)**：
        - 采用分层结构描述三大核心场景：
            - **场景 A: 智能体全生命周期管理 (Agent Lifecycle)**
                - 子场景：LLM 接入、本地 CLI 桥接、Webhook 集成、连接测试与保活。
            - **场景 B: 多模式聊天室交互 (Chatroom Interaction)**
                - 子场景：自由讨论区 (广播触发)、指令控制区 (@触发)、多 Agent 协作链 (A2A Loop Control)。
            - **场景 C: 企业级运维与监控 (Enterprise Ops)**
                - 子场景：API 密钥池管理、实时日志审计流。
        - **绘制详细 PlantUML 图表**：
            - 为每个核心场景绘制独立的、更详细的用例图或活动图，体现分支逻辑。

    - [ ] **迁移并优化其他视图**：
        - 将原有 `project_architecture.md` 中的内容迁移到对应的新文件，并根据新的理解进行润色。

3.  **验证与交付**
    - [ ] 确保文档中的场景描述与代码实际逻辑完全一致。
    - [ ] 提交所有拆分后的架构文档。
