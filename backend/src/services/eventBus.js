import { EventEmitter } from 'events';
import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase listener limit for high concurrency
    this.setMaxListeners(50);
  }

  /**
   * Publish an event to the persistent store and in-memory listeners
   * @param {string} type - Event type (e.g., 'message.created')
   * @param {string} source - URN of source (e.g., 'agent:user-123')
   * @param {string} target - URN of target (e.g., 'room:general')
   * @param {object} payload - Business data
   * @param {object} metadata - Metadata (correlation_id, etc.)
   * @returns {Promise<string>} - Event ID
   */
  async publish(type, source, target, payload, metadata = {}) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const event = {
      id,
      type,
      source,
      target,
      payload,
      metadata: { ...metadata, timestamp }
    };

    console.log(`[EventBus] Publishing ${type} from ${source} to ${target}`);

    // 1. Persist to DB
    db.prepare(
      `INSERT INTO events (id, type, source, target, payload, metadata, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      type,
      source,
      target,
      JSON.stringify(payload),
      JSON.stringify(event.metadata),
      'pending'
    );

    // 2. Emit to in-memory listeners
    // We emit the full event object
    this.emit(type, event);

    // Also emit a wildcard '*' for global listeners (e.g., logger)
    this.emit('*', event);

    return id;
  }

  /**
   * Mark an event as processed (Optional, for future reliable delivery)
   */
  async markProcessed(eventId) {
    db.prepare("UPDATE events SET status = 'processed' WHERE id = ?").run(eventId);
  }
}

export const eventBus = new EventBus();
