/**
 * Migration 005: Create world_info table
 *
 * World Info allows dynamic context injection based on keywords.
 * Inspired by SillyTavern's World Info feature.
 */

import { db } from '../src/db.js';

export function up() {
  // Create world_info table
  db.exec(`
    CREATE TABLE IF NOT EXISTS world_info (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      name TEXT NOT NULL,
      keys TEXT,
      content TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      sticky INTEGER DEFAULT 0,
      "order" INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_world_info_room_id ON world_info(room_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_world_info_enabled ON world_info(enabled)`);

  console.log('[Migration 005] Successfully created world_info table');
}

export function down() {
  db.exec(`DROP TABLE IF EXISTS world_info`);
  console.log('[Migration 005] Successfully dropped world_info table');
}

export default { up, down };
