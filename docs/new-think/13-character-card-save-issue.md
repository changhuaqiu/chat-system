# 13. 角色卡保存失败问题根因分析

## 问题描述

**时间**: 2026-03-09
**现象**: 保存角色卡时报错 `CharacterCardEditor.jsx:119 保存失败：AxiosError: Request failed with status code 500`
**错误信息**: `SQLITE_ERROR: no such column: updated_at`

## 根因分析

### 问题 1：数据库文件路径不一致

**现象**:
- 后端日志显示保存失败，错误为 `no such column: updated_at`
- 检查发现存在两个数据库文件：
  - `backend/chat.db` (旧文件，6.5MB，包含历史数据)
  - `backend/data/chat.db` (新文件，151KB，空数据库)

**原因**:
`db.js` 原本使用相对路径 `'chat.db'`：
```javascript
// 问题代码
export const db = new sqlite3.Database('chat.db');
```

当后端服务器从不同目录启动时，SQLite 会创建多个数据库文件：
- 从 `backend/` 目录启动 → `backend/chat.db`
- 从其他目录启动 → 可能在其他位置创建

**影响**:
- 数据库表结构不一致（旧文件有 `updated_at` 列，新文件没有）
- 数据丢失风险
- 保存操作失败

**修复方案**:
```javascript
// 修复代码 - 使用绝对路径
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path: backend/data/chat.db
const dbPath = path.join(__dirname, '..', 'data', 'chat.db');

export const db = new sqlite3.Database(dbPath);
```

### 问题 2：YAMLLoader.save() 逻辑缺陷

**现象**:
- 保存操作返回成功，但数据库中没有数据
- 角色卡内容无法持久化

**原因**:
`YAMLLoader.save()` 方法只使用 `UPDATE` 语句：
```javascript
// 问题代码
db.run(
  'UPDATE bots SET character_card = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  [content, card.name || botId, botId],
  (err) => { ... }
);
```

如果 bot 记录不存在，`UPDATE` 不会影响任何行，但不会报错，导致：
- 保存操作"成功"返回
- 实际数据未写入数据库

**修复方案**:
```javascript
async save(botId, card) {
  const content = this.toYamlMarkdown(card);

  return new Promise((resolve, reject) => {
    // 先检查 bot 是否存在
    db.get('SELECT id FROM bots WHERE id = ?', [botId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        // Bot 不存在，执行 INSERT
        db.run(
          'INSERT INTO bots (id, name, character_card, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [botId, card.name || botId, content],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      } else {
        // Bot 存在，执行 UPDATE
        db.run(
          'UPDATE bots SET character_card = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [content, card.name || botId, botId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      }
    });
  });
}
```

## 修复步骤

### 1. 修复数据库路径 (`backend/src/db.js`)
- 使用 `path.join(__dirname, '..', 'data', 'chat.db')` 确保路径一致

### 2. 修复 YAMLLoader (`backend/src/services/loaders/YAMLLoader.js`)
- 添加 bot 存在性检查
- 不存在时执行 INSERT，存在时执行 UPDATE

### 3. 清理冗余数据库文件
```bash
# 删除旧的数据库文件
rm backend/chat.db

# 确保数据目录存在
mkdir -p backend/data
```

### 4. 恢复机器人数据
执行 SQL 恢复已知的机器人配置：
```sql
INSERT OR REPLACE INTO bots (id, name, avatar, color, status, provider_type, config)
VALUES
  ('bot-mmhgh4mb', '创意写作助手', NULL, 'bg-pink-500', 'online', 'oneapi', '{"model":"qwen3.5-plus","baseUrl":"http://8.145.44.153:3000/v1","apiKey":"***","provider":"oneapi"}'),
  ('bot-mmhm73ed', '数据分析助手', NULL, 'bg-orange-500', 'online', 'oneapi', '{"model":"doubao-seed-code","baseUrl":"http://8.145.44.153:3000/v1","apiKey":"***","provider":"oneapi"}');
```

## 验证步骤

1. **检查数据库路径**:
```bash
# 确认只有一个数据库文件
find backend -name "*.db" -type f
# 应只输出：backend/data/chat.db
```

2. **检查表结构**:
```bash
sqlite3 backend/data/chat.db "PRAGMA table_info(bots);"
# 应包含 updated_at 列
```

3. **测试保存功能**:
- 打开前端页面
- 编辑角色卡
- 点击保存
- 检查是否返回成功

4. **检查日志**:
```bash
tail -50 backend/logs/*.log
# 不应有 SQLITE_ERROR 错误
```

## 预防措施

1. **所有数据库路径使用绝对路径**:
   - 使用 `path.join(__dirname, ...)` 或 `path.resolve()`
   - 避免使用相对路径

2. **数据目录外置**:
   - 将 `data/` 目录与代码分离
   - 在 `.gitignore` 中排除数据文件

3. **保存操作验证**:
   - INSERT/UPDATE 后检查 `changes` 属性
   - 记录受影响的行数

4. **数据库迁移管理**:
   - 使用迁移脚本管理表结构变更
   - 确保所有环境表结构一致

## 相关文件

- `backend/src/db.js` - 数据库初始化
- `backend/src/services/loaders/YAMLLoader.js` - 角色卡保存逻辑
- `backend/src/routes/character-cards.js` - API 路由
- `backend/data/chat.db` - 数据库文件

## 提交记录

```
commit 3c437ce - Fix: YAMLLoader.save() should INSERT if bot doesn't exist
commit 24b0e66 - Fix: Use absolute path for database file to prevent empty database issue
```
