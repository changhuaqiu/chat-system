import { db } from '../db.js';

const FastifyPluginCallback = (fastify, options, done) => {
  fastify.get('/api/logs', async (request, reply) => {
    const { level, agent_id } = request.query;
    let query = 'SELECT * FROM system_logs';
    const params = [];
    const conditions = [];

    if (level) {
      conditions.push('level = ?');
      params.push(level);
    }

    if (agent_id) {
      conditions.push('agent_id = ?');
      params.push(agent_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT 100';

    try {
      const logs = db.prepare(query).all(...params);

      // Parse details if it's a JSON string
      const parsedLogs = logs.map(row => {
        let details = row.details;
        try {
          if (typeof details === 'string') {
            details = JSON.parse(details);
          }
        } catch (e) {
          // Keep as string if parsing fails
        }
        return { ...row, details };
      });

      return { success: true, logs: parsedLogs };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ success: false, error: 'Internal Server Error' });
    }
  });

  done();
};

export default FastifyPluginCallback;
