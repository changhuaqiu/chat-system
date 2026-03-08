# 补充 Python Worker 架构分析计划 (Revised)

## 目标
根据用户反馈，在现有的 4+1 视图架构文档中，显式地补充关于 "Worker" (特别是 Python Worker) 的设计与集成逻辑。同时，在逻辑视图中新增**功能模块交互图 (Module Interaction Diagram)**，强调模块解耦与能力插拔的设计。

## 步骤

1.  **补充逻辑视图 (02_logical_view.md)**
    - [ ] **新增 "功能模块交互视图" (Module Interaction View)**:
        - **绘制 PlantUML 组件图**:
            - **Frontend Modules**: Chat UI, Admin Dashboard, Auth Module.
            - **Backend Modules**: 
                - `Gateway Module` (API/Socket): 统一入口，负责协议转换。
                - `Event Core` (EventBus): 消息中枢，实现模块间解耦。
                - `Bot Orchestrator` (BotService): 负责调度与并发控制。
                - `Integration Layer` (Adaptors): 插件化适配器，支持 LLM/Worker 热插拔。
                - `External Worker` (Python): 独立计算单元。
            - **Data Access Module**: 统一数据层。
        - **解耦说明**: 强调通过 `EventBus` 和 `Adaptor Interface` 实现的松耦合设计，说明如何替换或新增模块而不影响整体架构。
    - [ ] **完善 "External Worker Subsystem"**:
        - 描述 Python Worker 作为独立服务进程的角色。
        - 说明 `WebhookAdaptor` 如何作为防腐层 (Anti-corruption Layer) 桥接 Core Runtime 和 External Worker。

2.  **补充过程视图 (03_process_view.md)**
    - [ ] **新增 "异步任务处理流程 (Async Worker Flow)"**:
        - 描述场景：BotService 触发 Webhook -> Worker 接收请求 -> 立即返回 ACK -> Worker 异步执行耗时任务 -> Worker 调用 `POST /api/chat/send` 回传结果。
    - [ ] **绘制新的序列图**:
        - 标题：`Sequence Diagram: Webhook Bot Async Processing`。
        - 参与者：BotService, WebhookAdaptor, Python Worker, Backend API。

3.  **补充物理视图 (05_physical_view.md)**
    - [ ] **更新部署拓扑图**:
        - 增加 `Python Worker Container` 节点。
        - 标示其与 `Node.js Process` 之间的双向 HTTP 通信路径。
    - [ ] **完善节点描述**:
        - 说明 Python Worker 的运行环境要求（Python 3.8+, FastAPI, 依赖库）。

4.  **补充场景视图 (01_scenario_view.md)**
    - [ ] **在 "场景 A" 中细化 Webhook 集成**:
        - 明确 "Python Worker" 是 Webhook 集成的一种典型实现，用于执行复杂逻辑（如数据分析、文件处理）。

5.  **验证与交付**
    - [ ] 确保新增的模块交互图清晰展示了“插拔”能力。
    - [ ] 确保 Worker 描述与 `python-worker/` 目录下的实际代码结构一致。
    - [ ] 提交更新后的所有视图文档。
