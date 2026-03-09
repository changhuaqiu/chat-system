/**
 * World Info Manager
 *
 * Manages dynamic context injection based on keywords.
 * Inspired by SillyTavern's World Info feature.
 *
 * Features:
 * - Keyword-based triggering
 * - Priority-based ordering
 * - Sticky entries (always injected)
 * - Room-specific entries
 */

import { db } from '../db.js';

export class WorldInfoManager {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute cache
  }

  /**
   * Get World Info entries for a room, filtered by keywords
   * @param {string} roomId - Room ID
   * @param {string} context - Message content for keyword matching
   * @returns {WorldInfoEntry[]}
   */
  getEntries(roomId, context = '') {
    const cacheKey = `${roomId}:${context}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.entries;
    }

    // Get all enabled entries for this room
    const rows = db.prepare(
      `SELECT * FROM world_info
       WHERE room_id = ? AND enabled = 1
       ORDER BY priority DESC, "order" ASC`
    ).all(roomId);

    if (!rows || rows.length === 0) {
      return [];
    }

    // Parse keys and match against context
    const matched = [];

    for (const row of rows) {
      let keys = [];
      try {
        keys = row.keys ? JSON.parse(row.keys) : [];
      } catch (e) {
        // If keys is a comma-separated string, split it
        keys = row.keys ? row.keys.split(',').map(k => k.trim()) : [];
      }

      // Check if sticky or matches keywords
      const isSticky = row.sticky === 1 || row.sticky === true;
      const hasMatch = keys.some(key =>
        context.toLowerCase().includes(key.toLowerCase())
      );

      if (isSticky || hasMatch) {
        matched.push({
          id: row.id,
          roomId: row.room_id,
          name: row.name,
          keys,
          content: row.content,
          priority: row.priority,
          enabled: true,
          sticky: isSticky,
          order: row.order
        });
      }
    }

    // Sort by priority (high first), then by order
    matched.sort((a, b) => b.priority - a.priority || a.order - b.order);

    // Cache the result
    this.cache.set(cacheKey, {
      entries: matched,
      timestamp: Date.now()
    });

    return matched;
  }

  /**
   * Inject World Info entries to a prompt
   * @param {WorldInfoEntry[]} entries - Entries to inject
   * @param {string} basePrompt - Original prompt
   * @returns {string} - Prompt with injected context
   */
  injectToPrompt(entries, basePrompt = '') {
    if (!entries || entries.length === 0) {
      return basePrompt;
    }

    const contextParts = entries.map(entry =>
      `## ${entry.name}\n${entry.content}`
    );

    const worldInfoContext = [
      '<WorldInfo>',
      'The following context is relevant to the current conversation:',
      '',
      ...contextParts,
      '',
      'Use this information to provide more accurate and contextually relevant responses.',
      '</WorldInfo>'
    ].join('\n');

    if (!basePrompt) {
      return worldInfoContext;
    }

    return `${basePrompt}\n\n${worldInfoContext}`;
  }

  /**
   * Get World Info content as a string (for prompt injection)
   * @param {string} roomId - Room ID
   * @param {string} context - Message content for keyword matching
   * @returns {string}
   */
  getInjectedContent(roomId, context = '') {
    const entries = this.getEntries(roomId, context);
    return this.formatEntries(entries);
  }

  /**
   * Format entries as a string for prompt injection
   * @param {WorldInfoEntry[]} entries
   * @returns {string}
   */
  formatEntries(entries) {
    if (!entries || entries.length === 0) {
      return '';
    }

    const parts = entries.map(e => `[${e.name}]: ${e.content}`);
    return `Context: ${parts.join(' | ')}`;
  }

  /**
   * Create a new World Info entry
   * @param {Object} entry - Entry data
   * @returns {string} - Created entry ID
   */
  create(entry) {
    const id = entry.id || `wi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const keys = Array.isArray(entry.keys) ? JSON.stringify(entry.keys) : entry.keys;

    db.prepare(
      `INSERT INTO world_info (id, room_id, name, keys, content, priority, enabled, sticky, "order")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      entry.roomId,
      entry.name,
      keys,
      entry.content,
      entry.priority || 0,
      entry.enabled !== false ? 1 : 0,
      entry.sticky ? 1 : 0,
      entry.order || 0
    );

    return id;
  }

  /**
   * Update an existing World Info entry
   * @param {string} id - Entry ID
   * @param {Object} entry - Updated entry data
   * @returns {void}
   */
  update(id, entry) {
    const keys = Array.isArray(entry.keys) ? JSON.stringify(entry.keys) : entry.keys;

    db.prepare(
      `UPDATE world_info
       SET room_id = ?, name = ?, keys = ?, content = ?,
           priority = ?, enabled = ?, sticky = ?, "order" = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      entry.roomId,
      entry.name,
      keys,
      entry.content,
      entry.priority || 0,
      entry.enabled !== false ? 1 : 0,
      entry.sticky ? 1 : 0,
      entry.order || 0,
      id
    );

    // Invalidate cache
    this.cache.clear();
  }

  /**
   * Delete a World Info entry
   * @param {string} id - Entry ID
   * @returns {void}
   */
  delete(id) {
    db.prepare('DELETE FROM world_info WHERE id = ?').run(id);

    // Invalidate cache
    this.cache.clear();
  }

  /**
   * Get all entries for a room (admin function)
   * @param {string} roomId - Room ID
   * @returns {WorldInfoEntry[]}
   */
  getAllForRoom(roomId) {
    const rows = db.prepare(
      'SELECT * FROM world_info WHERE room_id = ? ORDER BY priority DESC, "order" ASC'
    ).all(roomId);

    const entries = rows.map(row => ({
      id: row.id,
      roomId: row.room_id,
      name: row.name,
      keys: row.keys ? JSON.parse(row.keys) : [],
      content: row.content,
      priority: row.priority,
      enabled: row.enabled === 1,
      sticky: row.sticky === 1,
      order: row.order
    }));

    return entries;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const worldInfoManager = new WorldInfoManager();
export default WorldInfoManager;
