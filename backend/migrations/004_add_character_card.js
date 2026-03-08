/**
 * Migration 004: Add character_card column to bots table
 *
 * This migration adds support for SillyTavern-style character cards
 * to make bot responses more personalized.
 */

import { db } from '../src/db.js';

export async function up() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Add character_card column to bots table
      db.run(`
        ALTER TABLE bots ADD COLUMN character_card TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          reject(err);
          return;
        }

        // Add default character_card for existing bots (empty JSON)
        db.run(`
          UPDATE bots
          SET character_card = '{"name": "", "description": "", "personality": "", "scenario": "", "mes_example": "", "first_mes": "", "system_prompt": "", "post_history_instructions": "", "avatar": "", "creator_notes": "", "tags": [], "version": "chara-card-v2", "extensions": {}}'
          WHERE character_card IS NULL
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          console.log('[Migration 004] Successfully added character_card column to bots table');
          resolve();
        });
      });
    });
  });
}

export async function down() {
  return new Promise((resolve, reject) => {
    // SQLite doesn't support DROP COLUMN directly in older versions
    // We'll just leave the column as nullable for rollback
    console.log('[Migration 004] Rollback: character_card column left in place (SQLite limitation)');
    resolve();
  });
}

export default { up, down };
