/**
 * Chat Rooms Routes for Fastify
 */
import { v4 as uuidv4 } from 'uuid';
import { botService } from '../services/botService.js';

export function roomsRoutes(fastify, options, done) {
  const db = fastify.db;

  fastify.get('/api/rooms', async (request, reply) => {
    try {
      const rooms = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM rooms ORDER BY created_at DESC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      reply.send({ success: true, rooms });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.get('/api/rooms/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const room = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (!room) {
        return reply.code(404).send({ success: false, error: 'Room not found' });
      }
      reply.send({ success: true, room });
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
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO rooms (id, name, description, type, created_by) VALUES (?, ?, ?, ?, ?)',
          [id, name, description || '', type, createdBy || 'system'],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      reply.code(201).send({ success: true, room: { id, name, description, type, created_by: createdBy || 'system' } });
    } catch (error) {
      console.error('Error creating room:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  fastify.delete('/api/rooms/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM messages WHERE room_id = ?', [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      const result = await new Promise((resolve, reject) => {
        db.run('DELETE FROM rooms WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
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
      const room = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (!room) {
        return reply.code(404).send({ success: false, error: 'Room not found' });
      }
      const messages = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT ?',
          [id, parseInt(limit)],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.reverse());
          }
        );
      });

      // Fetch reactions for these messages
      const messageIds = messages.length > 0 ? messages.map(m => `'${m.id}'`).join(',') : null;
      let reactions = [];
      
      if (messageIds) {
        reactions = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM message_reactions WHERE message_id IN (${messageIds})`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
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
