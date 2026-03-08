/**
 * World Info API Routes
 *
 * CRUD operations for World Info entries.
 */

import { db } from '../db.js';
import { worldInfoManager } from '../services/WorldInfoManager.js';

export async function worldInfoRoutes(fastify, options) {
  // GET /api/world-info/room/:roomId - Get all World Info entries for a room
  fastify.get('/api/world-info/room/:roomId', async (request, reply) => {
    const { roomId } = request.params;
    try {
      const entries = await worldInfoManager.getAllForRoom(roomId);
      reply.send({ success: true, entries });
    } catch (error) {
      console.error('Error fetching World Info entries:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/world-info/room/:roomId/match - Get matched entries for a message
  fastify.get('/api/world-info/room/:roomId/match', async (request, reply) => {
    const { roomId } = request.params;
    const { context } = request.query;

    try {
      const entries = await worldInfoManager.getEntries(roomId, context || '');
      reply.send({ success: true, entries });
    } catch (error) {
      console.error('Error matching World Info entries:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/world-info - Create a new World Info entry
  fastify.post('/api/world-info', async (request, reply) => {
    const entry = request.body;

    try {
      // Validate required fields
      if (!entry.roomId || !entry.name || !entry.content) {
        return reply.code(400).send({
          success: false,
          error: 'roomId, name, and content are required'
        });
      }

      const id = await worldInfoManager.create(entry);
      reply.code(201).send({ success: true, id, entry });
    } catch (error) {
      console.error('Error creating World Info entry:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // PUT /api/world-info/:id - Update a World Info entry
  fastify.put('/api/world-info/:id', async (request, reply) => {
    const { id } = request.params;
    const entry = request.body;

    try {
      await worldInfoManager.update(id, entry);
      reply.send({ success: true, id, entry });
    } catch (error) {
      console.error('Error updating World Info entry:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // DELETE /api/world-info/:id - Delete a World Info entry
  fastify.delete('/api/world-info/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await worldInfoManager.delete(id);
      reply.send({ success: true, message: 'Entry deleted' });
    } catch (error) {
      console.error('Error deleting World Info entry:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/world-info/bulk - Bulk create/update entries
  fastify.post('/api/world-info/bulk', async (request, reply) => {
    const { roomId, entries } = request.body;

    try {
      if (!roomId || !Array.isArray(entries)) {
        return reply.code(400).send({
          success: false,
          error: 'roomId and entries array are required'
        });
      }

      const results = [];
      for (const entry of entries) {
        try {
          if (entry.id) {
            await worldInfoManager.update(entry.id, entry);
            results.push({ id: entry.id, action: 'updated' });
          } else {
            const id = await worldInfoManager.create({ ...entry, roomId });
            results.push({ id, action: 'created' });
          }
        } catch (e) {
          results.push({ error: e.message, entry });
        }
      }

      reply.send({ success: true, results });
    } catch (error) {
      console.error('Error bulk processing World Info entries:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/world-info/test - Test keyword matching
  fastify.get('/api/world-info/test', async (request, reply) => {
    const { roomId, message } = request.query;

    try {
      if (!roomId || !message) {
        return reply.code(400).send({
          success: false,
          error: 'roomId and message are required'
        });
      }

      const entries = await worldInfoManager.getEntries(roomId, message);
      const matched = entries.filter(e => !e.sticky);
      const sticky = entries.filter(e => e.sticky);

      reply.send({
        success: true,
        message,
        matched: {
          count: matched.length,
          entries: matched.map(e => ({ name: e.name, matchedKeys: e.keys }))
        },
        sticky: {
          count: sticky.length,
          entries: sticky.map(e => ({ name: e.name }))
        }
      });
    } catch (error) {
      console.error('Error testing World Info matching:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}

export default worldInfoRoutes;
