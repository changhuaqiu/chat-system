/**
 * Migration: Add Dashboard Stats Table
 *
 * Creates a table for storing pre-computed dashboard statistics snapshots.
 * This enables historical data comparison and improves query performance.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'chat.db');
const db = new Database(dbPath);

export const up = () => {
  // Create dashboard_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_date DATE NOT NULL UNIQUE,
      total_messages INTEGER DEFAULT 0,
      total_agents INTEGER DEFAULT 0,
      active_users INTEGER DEFAULT 0,
      api_calls INTEGER DEFAULT 0,
      avg_latency_ms INTEGER DEFAULT 0,
      new_messages INTEGER DEFAULT 0,
      new_agents INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created dashboard_stats table.');

  // Create index for faster date queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dashboard_stats_date
    ON dashboard_stats(stat_date)
  `);
  console.log('Created index on dashboard_stats.stat_date.');

  // Create api_key_usage_logs indexes if not exist
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_usage_logs_model
      ON api_key_usage_logs(model_name)
    `);
    console.log('Ensured index on api_key_usage_logs.model_name.');
  } catch (err) {
    // Index might already exist or table doesn't exist, ignore
  }

  return Promise.resolve();
};

export const down = () => {
  db.exec('DROP TABLE IF EXISTS dashboard_stats');
  console.log('Dropped dashboard_stats table.');
  return Promise.resolve();
};

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  up().then(() => {
    console.log('Migration completed.');
    process.exit(0);
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
