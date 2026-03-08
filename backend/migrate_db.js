
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('chat.db');

db.run("ALTER TABLE messages ADD COLUMN reply_to_id TEXT", (err) => {
    if (err) console.log('Column reply_to_id might already exist or error:', err.message);
    else console.log('Added reply_to_id column');
});

db.run(`CREATE TABLE IF NOT EXISTS message_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(message_id, user_id, emoji)
    )`, (err) => {
    if (err) console.log('Error creating message_reactions:', err.message);
    else console.log('Created message_reactions table');
});
