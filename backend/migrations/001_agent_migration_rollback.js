/**
 * Database Rollback Script
 * 回滚 001_agent_migration.js 的变更
 * 
 * 执行方式: node migrations/001_agent_migration_rollback.js
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('chat.db');

const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

async function rollback() {
  console.log('开始回滚数据库...\n');

  try {
    // Step 1: 备份新表数据
    console.log('Step 1: 备份新表数据...');
    const agentsData = await dbAll('SELECT * FROM agents');
    const mappingsData = await dbAll('SELECT * FROM agent_mappings');
    console.log(`  - 备份了 ${agentsData.length} 条 agents 记录`);
    console.log(`  - 备份了 ${mappingsData.length} 条 agent_mappings 记录\n`);

    // Step 2: 重新创建旧表
    console.log('Step 2: 重新创建旧表...');
    
    await dbRun(`
      CREATE TABLE IF NOT EXISTS bots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        model TEXT,
        api_key TEXT,
        status TEXT DEFAULT 'offline',
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  - 创建 bots 表 ✅');

    await dbRun(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP
      )
    `);
    console.log('  - 创建 api_keys 表 ✅\n');

    // Step 3: 迁移数据回去
    console.log('Step 3: 迁移数据回旧表...');
    
    for (const agent of agentsData) {
      await dbRun(`
        INSERT OR REPLACE INTO bots (id, name, model, status, last_active)
        VALUES (?, ?, ?, ?, ?)
      `, [agent.id, agent.name, agent.role, agent.status, agent.last_active]);
    }
    console.log(`  - 迁移了 ${agentsData.length} 条 agents → bots ✅`);

    for (const mapping of mappingsData) {
      if (mapping.mapping_type === 'api_key') {
        await dbRun(`
          INSERT OR REPLACE INTO api_keys (key, name, created_at)
          VALUES (?, ?, ?)
        `, [mapping.mapping_key, mapping.mapping_value, mapping.created_at]);
      }
    }
    console.log(`  - 迁移了 ${mappingsData.length} 条 agent_mappings → api_keys ✅\n`);

    // Step 4: 删除新表
    console.log('Step 4: 删除新表...');
    
    await dbRun('DROP TABLE IF EXISTS agents');
    console.log('  - 删除 agents 表 ✅');
    
    await dbRun('DROP TABLE IF EXISTS agent_mappings');
    console.log('  - 删除 agent_mappings 表 ✅\n');

    console.log('✅ 回滚完成！\n');

  } catch (error) {
    console.error('❌ 回滚失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

rollback().catch(err => {
  console.error('Rollback failed:', err);
  process.exit(1);
});
