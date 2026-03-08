# 集成 One API 架构分析计划

## 目标
根据用户反馈，将 **One API** (统一 LLM 网关) 的逻辑显式地加入到 4+1 视图架构文档中。One API 在本项目中充当了 LLM 服务聚合层，负责统一接口格式、渠道管理和令牌分发，是架构中的关键基础设施。

## 步骤

1.  **更新场景视图 (01_scenario_view.md)**
    - [ ] **新增 "One API 网关集成" 场景**:
        - 描述 One API 如何作为中间件统一管理不同厂商 (OpenAI, Aliyun, etc.) 的 API Key。
        - 说明系统如何利用 One API 进行渠道映射 (Channel Mapping) 和 令牌隔离 (Token Isolation)。
    - [ ] **更新 "场景 A: 智能体全生命周期管理"**:
        - 在 "创建 Agent" 流程中，补充系统自动调用 `OneApiService` 为每个 Bot 创建独立渠道和 Token 的步骤。
    - [ ] **更新参与者与用例图**:
        - 将 "External System" 细化，增加 "One API Gateway" 作为系统内部依赖。

2.  **更新逻辑视图 (02_logical_view.md)**
    - [ ] **更新 "功能模块交互视图"**:
        - 在 `Integration Layer` 下方或旁边增加 `Model Gateway (One API)` 模块。
        - 明确 `LlmAdaptor` 指向 `One API` 而非直接指向外部 LLM。
    - [ ] **更新核心类图**:
        - 新增 `OneApiService` 类，包含 `setupBotEnv`, `createChannel`, `createToken` 等方法。
        - 展示 `BotController` 与 `OneApiService` 的依赖关系。

3.  **更新过程视图 (03_process_view.md)**
    - [ ] **新增 "Bot 创建与 One API 配置流程"**:
        - 序列图：Admin -> BotController -> OneApiService -> One API (Create User/Channel/Token) -> DB。
    - [ ] **更新 "消息发送与机器人回复" 序列图**:
        - 修改 `LlmAdaptor` 的调用路径：`LlmAdaptor` -> `One API Gateway` -> `External LLM`。

4.  **更新物理视图 (05_physical_view.md)**
    - [ ] **更新部署拓扑图**:
        - 增加 `One API Container/Process` 节点 (端口 3000/3002)。
        - 更新网络流向：Node.js -> One API -> External LLMs。
    - [ ] **补充环境要求**:
        - 说明 One API 的部署方式 (Docker / Binary)。

5.  **验证与交付**
    - [ ] 确保文档描述与 `OneApiService.js` 和 `docker-compose.yml` 中的实现一致。
    - [ ] 提交更新后的所有视图文档。
