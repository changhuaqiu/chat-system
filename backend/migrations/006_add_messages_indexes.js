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

export async function up() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Index for room_id lookups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Index for timestamp sorting
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Index for sender filtering
          db.run(`
            CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender)
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Composite index for room_id + timestamp queries (most common query pattern)
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp DESC)
            `, (err) => {
              if (err) {
                reject(err);
                return;
              }

              console.log('[Migration 006] Successfully created indexes on messages table');
              resolve();
            });
          });
        });
      });
    });
  });
}

export async function down() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let completed = 0;
      const total = 4;
      const errors = [];

      const checkComplete = () => {
        completed++;
        if (completed >= total) {
          if (errors.length > 0) {
            reject(new Error(errors.join('; ')));
          } else {
            console.log('[Migration 006] Successfully dropped indexes from messages table');
            resolve();
          }
        }
      };

      // Drop indexes
      db.run(`DROP INDEX IF EXISTS idx_messages_room_id`, (err) => {
        if (err) errors.push(err.message);
        checkComplete();
      });

      db.run(`DROP INDEX IF EXISTS idx_messages_timestamp`, (err) => {
        if (err) errors.push(err.message);
        checkComplete();
      });

      db.run(`DROP INDEX IF EXISTS idx_messages_sender`, (err) => {
        if (err) errors.push(err.message);
        checkComplete();
      });

      db.run(`DROP INDEX IF EXISTS idx_messages_room_timestamp`, (err) => {
        if (err) errors.push(err.message);
        checkComplete();
      });
    });
  });
}

export default { up, down };
