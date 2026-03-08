/**
 * Migration 005: Create world_info table
 *
 * World Info allows dynamic context injection based on keywords.
 * Inspired by SillyTavern's World Info feature.
 */

import { db } from '../src/db.js';

export async function up() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create world_info table
      db.run(`
        CREATE TABLE IF NOT EXISTS world_info (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          name TEXT NOT NULL,
          keys TEXT,              -- JSON array of trigger keywords
          content TEXT NOT NULL,
          priority INTEGER DEFAULT 0,
          enabled INTEGER DEFAULT 1,
          sticky INTEGER DEFAULT 0,  -- Always inject if true
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create indexes for faster lookups
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_world_info_room_id ON world_info(room_id)
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          db.run(`
            CREATE INDEX IF NOT EXISTS idx_world_info_enabled ON world_info(enabled)
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            console.log('[Migration 005] Successfully created world_info table');
            resolve();
          });
        });
      });
    });
  });
}

export async function down() {
  return new Promise((resolve, reject) => {
    db.run(`DROP TABLE IF EXISTS world_info`, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('[Migration 005] Successfully dropped world_info table');
      resolve();
    });
  });
}

export default { up, down };
