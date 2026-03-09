import { db } from '../db.js';
import { eventBus } from '../services/eventBus.js';
import { v4 as uuidv4 } from 'uuid';

export function messageRoutes(fastify, options, done) {

  // Send Message (REST API for Agents/External)
  fastify.post('/api/chat/send', async (request, reply) => {
    const { roomId, sender, content, mentions = [], messageType = 'text', mediaUrl = null, replyToId = null, metadata = {} } = request.body;

    if (!roomId || !sender || !content) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const messageId = Date.now().toString(); // Or UUID
    const timestamp = new Date().toISOString();

    const messageData = {
        id: messageId, roomId, sender, content, mentions,
        messageType, mediaUrl, timestamp, replyToId, metadata
    };

    const sourceUrn = sender === 'user' ? `agent:user:${sender}` : `agent:${sender}`;
    const targetUrn = `room:${roomId}`;

    try {
        // Publish to Event Bus
        // This will persist to 'events' table and trigger listeners (BotService, Socket, MessagePersister)
        await eventBus.publish('message.created', sourceUrn, targetUrn, messageData);

        reply.send({ success: true, message: messageData });
    } catch (error) {
        console.error('Error sending message:', error);
        reply.code(500).send({ error: error.message });
    }
  });

  // Receive Events from Python Worker (Callback)
  fastify.post('/api/events', async (request, reply) => {
    const { type, source, target, payload, metadata } = request.body;

    if (!type || !source || !target || !payload) {
        return reply.code(400).send({ error: 'Missing required fields' });
    }

    try {
        // Publish event from Worker
        await eventBus.publish(type, source, target, payload, metadata);
        reply.send({ success: true });
    } catch (error) {
        console.error('Error processing event callback:', error);
        reply.code(500).send({ error: error.message });
    }
  });

  // Toggle Reaction
  fastify.post('/api/messages/:id/react', async (request, reply) => {
    const { id } = request.params;
    const { userId, emoji } = request.body;

    if (!userId || !emoji) {
      return reply.code(400).send({ error: 'Missing userId or emoji' });
    }

    try {
      // Check if reaction exists
      const row = db.prepare('SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').get(id, userId, emoji);

      if (row) {
        // Remove reaction (Toggle off)
        db.prepare('DELETE FROM message_reactions WHERE id = ?').run(row.id);

        // Emit update via Socket
        if (fastify.io) {
            fastify.io.emit('reactionUpdate', { messageId: id, userId, emoji, action: 'remove' });
        }
        reply.send({ success: true, action: 'removed' });
      } else {
        // Add reaction (Toggle on)
        db.prepare('INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)').run(id, userId, emoji);

        // Emit update via Socket
        if (fastify.io) {
            fastify.io.emit('reactionUpdate', { messageId: id, userId, emoji, action: 'add' });
        }
        reply.send({ success: true, action: 'added' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  done();
}
