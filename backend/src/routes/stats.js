import { db } from '../db.js';

export const statsRoutes = async (fastify, options) => {
  fastify.get('/api/stats', async (request, reply) => {
    try {
      const getCount = (query, params = []) => {
        return new Promise((resolve, reject) => {
          db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.count : 0);
          });
        });
      };

      const [totalAgents, activeAgents, totalMessages, todayMessages] = await Promise.all([
        getCount('SELECT COUNT(*) as count FROM bots'),
        getCount("SELECT COUNT(*) as count FROM bots WHERE status = 'online'"),
        getCount('SELECT COUNT(*) as count FROM messages'),
        getCount("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) = date('now')")
      ]);

      return {
        totalAgents,
        activeAgents,
        totalMessages,
        todayMessages
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
