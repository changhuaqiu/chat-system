/**
 * Migration Runner
 *
 * Executes all pending migrations in order.
 * Only runs migrations with ES Module format (export up/down functions).
 * Usage: node migrations/run.js
 *
 * Note: Migrations 001-004 are old format (standalone scripts) and are
 * executed directly. This runner handles migrations 005+.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration files that use old format (standalone scripts) - skip these
const SKIP_MIGRATIONS = [
  '001_agent_migration.js',
  '001_agent_migration_rollback.js',
  '002_add_provider_support.js',
  '003_add_bot_stats.js',
  '004_add_character_card.js'
];

// Get database path from environment or use default
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'chat.db');

// Create database connection
const db = new Database(DB_PATH);

// Ensure migrations table exists
function ensureMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get list of executed migrations
function getExecutedMigrations() {
  const rows = db.prepare('SELECT name FROM migrations ORDER BY id').all();
  return rows.map(row => row.name);
}

// Record migration as executed
function recordMigration(name) {
  db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
}

// Run a single migration
async function runMigration(migrationFile) {
  const migrationName = path.basename(migrationFile, '.js');

  // Skip old format migrations
  if (SKIP_MIGRATIONS.includes(migrationFile)) {
    console.log(`  ⚭ Skipped (old format): ${migrationName}`);
    return false;
  }

  try {
    console.log(`Running migration: ${migrationName}...`);

    const migration = await import(`./${migrationName}.js`);

    // Only run migrations with ES Module format (up/down exports)
    if (typeof migration.up === 'function') {
      await migration.up(db);
      recordMigration(migrationName);
      console.log(`✓ Migration ${migrationName} completed`);
      return true;
    } else {
      console.log(`  ⚭ Skipped (no up function): ${migrationName}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Migration ${migrationName} failed:`, error.message);
    throw error;
  }
}

// Main function
async function runMigrations() {
  console.log('Starting migration runner...\n');

  try {
    // Ensure migrations table exists
    ensureMigrationsTable();
    console.log('Migrations table ready\n');

    // Get executed migrations
    const executed = getExecutedMigrations();
    console.log(`Executed migrations: ${executed.length}`);

    // Get migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter(file => /^\d+_.*\.js$/.test(file) && file !== 'run.js')
      .map(file => path.basename(file, '.js'))
      .sort();

    console.log(`Available migrations: ${migrationFiles.length}\n`);

    // Find pending migrations
    const pending = migrationFiles.filter(name => !executed.includes(name));

    if (pending.length === 0) {
      console.log('✓ Database is up to date. No pending migrations.');
      return;
    }

    console.log(`Pending migrations: ${pending.length}\n`);

    // Run pending migrations
    for (const migrationName of pending) {
      const migrationFile = migrationName + '.js';

      // Skip old format migrations (they are standalone scripts)
      if (SKIP_MIGRATIONS.includes(migrationFile)) {
        console.log(`  ⚭ Skipped (old format - standalone script): ${migrationName}`);
        // Mark old format migrations as executed to avoid re-running
        recordMigration(migrationName);
        continue;
      }

      await runMigration(migrationName);
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration runner failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    db.close();
    process.exit(0);
  }
}

// Run migrations
runMigrations();
