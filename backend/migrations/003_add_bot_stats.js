
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
    // Create bot_stats table
    db.run(`
      CREATE TABLE IF NOT EXISTS bot_stats (
        bot_id TEXT PRIMARY KEY,
        total_requests INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        last_latency_ms INTEGER DEFAULT 0,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(bot_id) REFERENCES bots(id)
      )
    `);
    
    console.log('Created bot_stats table.');
  });
};

up();
