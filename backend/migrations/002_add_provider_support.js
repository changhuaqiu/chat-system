
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM specific: __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();
const dbPath = path.resolve(__dirname, '../chat.db');
const db = new sqlite.Database(dbPath);

const up = () => {
  db.serialize(() => {
    // 1. Rename old table
    db.run("ALTER TABLE bots RENAME TO bots_old");

    // 2. Create new table with provider support
    db.run(`
      CREATE TABLE bots (
        id TEXT PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        provider_type TEXT DEFAULT 'llm',  -- llm, openclaw, cli, webhook
        config TEXT,                       -- JSON string
        status TEXT DEFAULT 'offline',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Migrate data (Assume all old bots are LLM)
    db.all("SELECT * FROM bots_old", (err, rows) => {
      if (err) {
        console.error("Failed to read old bots", err);
        return;
      }
      
      const stmt = db.prepare("INSERT INTO bots (id, name, avatar, provider_type, config, status) VALUES (?, ?, ?, ?, ?, ?)");
      
      rows.forEach(row => {
        // Default config for legacy bots (assuming they were OpenAI)
        const config = JSON.stringify({
          model: row.model || 'gpt-3.5-turbo',
          apiKey: '', // Legacy table didn't have API key per bot?
          systemPrompt: row.system_prompt || ''
        });
        
        stmt.run(row.id, row.name, row.avatar, 'llm', config, row.status);
      });
      
      stmt.finalize();
      console.log(`Migrated ${rows.length} bots.`);
    });

    // 4. Drop old table (Optional, keep for safety)
    // db.run("DROP TABLE bots_old");
  });
};

up();
