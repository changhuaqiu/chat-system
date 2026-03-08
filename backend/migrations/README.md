# Database Migrations

数据库迁移脚本目录

## 迁移列表

### 001_agent_migration.js

**目的**: 从 bots/api_keys 表迁移到 agents/agent_mappings 表

**变更内容**:
- 删除 `bots` 表
- 删除 `api_keys` 表
- 创建 `agents` 表
- 创建 `agent_mappings` 表

**agents 表结构**:
```sql
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- role (TEXT)
- color (TEXT)
- avatar (TEXT)
- status (TEXT DEFAULT 'offline')
- session_key (TEXT)
- last_active (TIMESTAMP)
- created_at (TIMESTAMP)
```

**agent_mappings 表结构**:
```sql
- id (INTEGER PRIMARY KEY)
- agent_id (TEXT NOT NULL)
- mapping_type (TEXT NOT NULL)
- mapping_key (TEXT NOT NULL)
- mapping_value (TEXT)
- created_at (TIMESTAMP)
```

**使用方法**:
```bash
cd backend
node migrations/001_agent_migration.js
```

**回滚方法**:
```bash
cd backend
node migrations/001_agent_migration_rollback.js
```

## 注意事项

1. **备份数据**: 执行迁移前，请确保已备份 `chat.db` 文件
2. **停止服务**: 迁移期间请停止后端服务
3. **验证结果**: 迁移后请验证数据完整性

## 迁移历史

| 版本 | 日期 | 描述 |
|------|------|------|
| 001 | 2026-03-05 | bots/api_keys → agents/agent_mappings |
