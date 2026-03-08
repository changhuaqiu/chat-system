import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('chat.db');

export const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS bots (
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      avatar TEXT,
      provider_type TEXT DEFAULT 'llm',
      config TEXT,
      status TEXT DEFAULT 'offline',
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      capabilities TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, room_id TEXT NOT NULL, sender TEXT NOT NULL,
      content TEXT NOT NULL, mentions TEXT, message_type TEXT DEFAULT 'text',
      media_url TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reply_to_id TEXT, metadata TEXT, is_deleted INTEGER DEFAULT 0,
      updated_at TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY, message_id TEXT NOT NULL,
      file_name TEXT, file_type TEXT, file_size INTEGER,
      url TEXT, thumbnail_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS message_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(message_id, user_id, emoji)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      type TEXT DEFAULT 'free', created_by TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      settings TEXT, owner_id TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used TIMESTAMP,
      environment TEXT,
      status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT,
      message TEXT,
      agent_id TEXT,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS agent_mappings (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL, avatar TEXT, description TEXT,
      status TEXT DEFAULT 'offline', last_active TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, type TEXT, source TEXT, target TEXT,
      payload TEXT, metadata TEXT, status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migrations: Add columns if they don't exist
    const safeAddColumn = (table, columnDef) => {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`, (err) => {
        // Ignore error if column already exists
      });
    };

    safeAddColumn('messages', 'metadata TEXT');
    safeAddColumn('messages', 'is_deleted INTEGER DEFAULT 0');
    safeAddColumn('messages', 'updated_at TIMESTAMP');
    safeAddColumn('messages', 'reply_to_id TEXT');
    safeAddColumn('rooms', 'settings TEXT');
    safeAddColumn('rooms', 'owner_id TEXT');
    safeAddColumn('bots', 'description TEXT');
    safeAddColumn('bots', 'capabilities TEXT');
    safeAddColumn('bots', 'color TEXT');
    safeAddColumn('bots', 'character_card TEXT');
    
    // Events table migrations
    safeAddColumn('events', 'type TEXT');
    safeAddColumn('events', 'source TEXT');
    safeAddColumn('events', 'target TEXT');
    safeAddColumn('events', 'payload TEXT');
    safeAddColumn('events', 'metadata TEXT');
    safeAddColumn('events', 'status TEXT');
    safeAddColumn('events', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    // api_keys table migrations
    safeAddColumn('api_keys', 'environment TEXT');
    safeAddColumn('api_keys', 'status TEXT');

    // Create bot_stats table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS bot_stats (
      bot_id TEXT PRIMARY KEY,
      total_requests INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      last_latency_ms INTEGER DEFAULT 0,
      last_active TIMESTAMP
    )`);

    // One-API Channel Mapping table
    db.run(`CREATE TABLE IF NOT EXISTS oneapi_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_id TEXT UNIQUE NOT NULL,
      channel_id INTEGER,
      channel_name TEXT,
      token_id INTEGER,
      token_key TEXT,
      provider_type TEXT,
      model_name TEXT,
      original_api_key TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
    )`);

    // API Key Quota Management Tables
    // Add quota columns to api_keys table
    safeAddColumn('api_keys', 'quota_limit INTEGER DEFAULT -1');
    safeAddColumn('api_keys', 'quota_used INTEGER DEFAULT 0');
    safeAddColumn('api_keys', 'rate_limit INTEGER DEFAULT 60');
    safeAddColumn('api_keys', 'expires_at TIMESTAMP');

    // API Key Model Quotas table
    db.run(`CREATE TABLE IF NOT EXISTS api_key_model_quotas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT NOT NULL,
      model_name TEXT NOT NULL,
      request_limit INTEGER DEFAULT -1,
      request_used INTEGER DEFAULT 0,
      rate_limit INTEGER DEFAULT 60,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(api_key, model_name),
      FOREIGN KEY (api_key) REFERENCES api_keys(key) ON DELETE CASCADE
    )`);

    // Create indexes for api_key_model_quotas
    db.run(`CREATE INDEX IF NOT EXISTS idx_model_quotas_api_key ON api_key_model_quotas(api_key)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_model_quotas_model ON api_key_model_quotas(model_name)`);

    // API Key Usage Logs table
    db.run(`CREATE TABLE IF NOT EXISTS api_key_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT NOT NULL,
      model_name TEXT,
      request_count INTEGER DEFAULT 1,
      tokens_used INTEGER DEFAULT 0,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create indexes for api_key_usage_logs
    db.run(`CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON api_key_usage_logs(api_key)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON api_key_usage_logs(created_at)`);

    // World Info table for dynamic context injection
    db.run(`CREATE TABLE IF NOT EXISTS world_info (
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
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_world_info_room ON world_info(room_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_world_info_enabled ON world_info(enabled)`);
  });
};
