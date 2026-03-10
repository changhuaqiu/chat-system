/**
 * Chat Rooms Routes for Fastify
 */
import { v4 as uuidv4 } from 'uuid';
import { botService } from '../services/botService.js';

export function roomsRoutes(fastify, options, done) {
  const db = fastify.db;

  fastify.get('/api/rooms', async (request, reply) => {
    try {
      const rows = db.prepare('SELECT * FROM rooms ORDER BY created_at DESC').all();
      reply.send({ success: true, rooms: rows });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/api/rooms/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
      if (!row) {
        return reply.code(404).send({ success: false, error: 'Room not found' });
      }
      reply.send({ success: true, room: row });
    } catch (error) {
      console.error('Error fetching room:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.post('/api/rooms', async (request, reply) => {
    try {
      const { name, description, type = 'free', createdBy } = request.body;
      if (!name) {
        return reply.code(400).send({ success: false, error: 'Room name is required' });
      }
      const id = uuidv4();
      db.prepare(
        'INSERT INTO rooms (id, name, description, type, created_by) VALUES (?, ?, ?, ?, ?)'
      ).run(id, name, description || '', type, createdBy || 'system');
      reply.code(201).send({ success: true, room: { id, name, description, type, created_by: createdBy || 'system' } });
    } catch (error) {
      console.error('Error creating room:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.delete('/api/rooms/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      db.prepare('DELETE FROM messages WHERE room_id = ?').run(id);
      const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
      if (result.changes === 0) {
        return reply.code(404).send({ success: false, error: 'Room not found' });
      }
      reply.send({ success: true, deleted: id });
    } catch (error) {
      console.error('Error deleting room:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/api/rooms/:id/messages', async (request, reply) => {
    try {
      const { id } = request.params;
      const { limit = 50 } = request.query;
      const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
      if (!room) {
        return reply.code(404).send({ success: false, error: 'Room not found' });
      }
      const messages = db.prepare(
        'SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT ?'
      ).all(id, parseInt(limit)).reverse();

      // Fetch reactions for these messages
      const messageIds = messages.length > 0 ? messages.map(m => `'${m.id}'`).join(',') : null;
      let reactions = [];

      if (messageIds) {
        reactions = db.prepare(
          `SELECT * FROM message_reactions WHERE message_id IN (${messageIds})`
        ).all();
      }

      // Normalize messages to camelCase and attach reactions
      const normalizedMessages = messages.map(msg => ({
        id: msg.id,
        roomId: msg.room_id,
        sender: msg.sender,
        content: msg.content,
        mentions: msg.mentions ? JSON.parse(msg.mentions) : [],
        messageType: msg.message_type,
        mediaUrl: msg.media_url,
        timestamp: msg.timestamp,
        replyToId: msg.reply_to_id,
        metadata: msg.metadata,
        reactions: reactions.filter(r => r.message_id === msg.id)
      }));

      reply.send({ success: true, messages: normalizedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  done();
}
