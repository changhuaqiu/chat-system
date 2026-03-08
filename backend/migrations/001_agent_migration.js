/**
 * Database Migration Script
 * 从 bots/api_keys 表迁移到 agents/agent_mappings 表
 * 
 * 执行方式: node migrations/001_agent_migration.js
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('chat.db');

// Promisify db methods
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

async function migrate() {
  console.log('开始数据库迁移...\n');

  try {
    // Step 1: 备份旧表数据
    console.log('Step 1: 备份旧表数据...');
    const botsData = await dbAll('SELECT * FROM bots');
    const apiKeysData = await dbAll('SELECT * FROM api_keys');
    console.log(`  - 备份了 ${botsData.length} 条 bots 记录`);
    console.log(`  - 备份了 ${apiKeysData.length} 条 api_keys 记录\n`);

    // Step 2: 创建新表
    console.log('Step 2: 创建新表...');
    
    // agents 表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT,
        color TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'offline',
        session_key TEXT,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  - 创建 agents 表 ✅');

    // agent_mappings 表 (替代 api_keys)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS agent_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        mapping_type TEXT NOT NULL,
        mapping_key TEXT NOT NULL,
        mapping_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id),
        UNIQUE(agent_id, mapping_type, mapping_key)
      )
    `);
    console.log('  - 创建 agent_mappings 表 ✅\n');

    // Step 3: 迁移数据
    console.log('Step 3: 迁移数据...');
    
    // 迁移 bots → agents
    for (const bot of botsData) {
      await dbRun(`
        INSERT OR REPLACE INTO agents (id, name, role, status, last_active)
        VALUES (?, ?, ?, ?, ?)
      `, [bot.id, bot.name, bot.model, bot.status, bot.last_active]);
    }
    console.log(`  - 迁移了 ${botsData.length} 条 bots → agents ✅`);

    // 迁移 api_keys → agent_mappings
    for (const apiKey of apiKeysData) {
      await dbRun(`
        INSERT OR REPLACE INTO agent_mappings (agent_id, mapping_type, mapping_key, mapping_value, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, ['legacy', 'api_key', apiKey.key, apiKey.name, apiKey.created_at]);
    }
    console.log(`  - 迁移了 ${apiKeysData.length} 条 api_keys → agent_mappings ✅\n`);

    // Step 4: 删除旧表
    console.log('Step 4: 删除旧表...');
    
    await dbRun('DROP TABLE IF EXISTS bots');
    console.log('  - 删除 bots 表 ✅');
    
    await dbRun('DROP TABLE IF EXISTS api_keys');
    console.log('  - 删除 api_keys 表 ✅\n');

    // Step 5: 验证迁移
    console.log('Step 5: 验证迁移结果...');
    const agentsCount = await dbAll('SELECT COUNT(*) as count FROM agents');
    const mappingsCount = await dbAll('SELECT COUNT(*) as count FROM agent_mappings');
    
    console.log(`  - agents 表: ${agentsCount[0].count} 条记录`);
    console.log(`  - agent_mappings 表: ${mappingsCount[0].count} 条记录\n`);

    console.log('✅ 数据库迁移完成！\n');
    
    // 显示新表结构
    console.log('新表结构:');
    console.log('\nagents 表:');
    const agentsSchema = await dbAll("PRAGMA table_info(agents)");
    agentsSchema.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    console.log('\nagent_mappings 表:');
    const mappingsSchema = await dbAll("PRAGMA table_info(agent_mappings)");
    mappingsSchema.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

// 执行迁移
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
