/**
 * Migration 006: Add indexes to messages table
 *
 * Adds indexes to improve query performance for:
 * - room_id lookups
 * - timestamp sorting
 * - sender filtering
 * - combined room_id + timestamp queries
 */

import { db } from '../src/db.js';

export function up() {
  // Check if messages table exists
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='messages'"
  ).get();

  if (!tableExists) {
    console.log('[Migration 006] Messages table does not exist yet, skipping index creation');
    return;
  }

  // Index for room_id lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)`);

  // Index for timestamp sorting
  db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);

  // Index for sender filtering
  db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender)`);

  // Composite index for room_id + timestamp queries (most common query pattern)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC)`);

  console.log('[Migration 006] Successfully created indexes on messages table');
}

export function down() {
  // Check if messages table exists
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='messages'"
  ).get();

  if (!tableExists) {
    return;
  }

  db.exec(`DROP INDEX IF EXISTS idx_messages_room_id`);
  db.exec(`DROP INDEX IF EXISTS idx_messages_timestamp`);
  db.exec(`DROP INDEX IF EXISTS idx_messages_sender`);
  db.exec(`DROP INDEX IF EXISTS idx_messages_room_timestamp`);

  console.log('[Migration 006] Successfully dropped indexes from messages table');
}

export default { up, down };
