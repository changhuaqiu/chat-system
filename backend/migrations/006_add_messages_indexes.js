/**
 * Migration 006: Add indexes to messages table
 *
 * Adds indexes to improve query performance for:
 * - room_id lookups
 * - timestamp sorting
 * - sender filtering
 * - combined room_id + timestamp queries
 */

export function up(db) {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
    CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC);
  `);

  console.log('[Migration 006] Successfully created indexes on messages table');
}

export function down(db) {
  db.exec(`
    DROP INDEX IF EXISTS idx_messages_room_id;
    DROP INDEX IF EXISTS idx_messages_timestamp;
    DROP INDEX IF EXISTS idx_messages_sender;
    DROP INDEX IF EXISTS idx_messages_room_timestamp;
  `);

  console.log('[Migration 006] Successfully dropped indexes from messages table');
}

export default { up, down };
