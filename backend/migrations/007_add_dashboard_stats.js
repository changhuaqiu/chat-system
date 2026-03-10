/**
 * Migration 007: Add Dashboard Stats Table
 *
 * Creates a table for storing pre-computed dashboard statistics snapshots.
 */

export function up(db) {
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

  // Create index for faster date queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dashboard_stats_date
    ON dashboard_stats(stat_date)
  `);

  // Create api_key_usage_logs indexes if not exist
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_usage_logs_model
      ON api_key_usage_logs(model_name)
    `);
  } catch (err) {
    // Table might not exist, ignore
  }

  console.log('[Migration 007] Successfully created dashboard_stats table');
}

export function down(db) {
  db.exec(`DROP TABLE IF EXISTS dashboard_stats`);
  console.log('[Migration 007] Successfully dropped dashboard_stats table');
}

export default { up, down };
