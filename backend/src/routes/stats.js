import { db } from '../db.js';

/**
 * Stats Routes - Using better-sqlite3 synchronous API
 */
export const statsRoutes = async (fastify, options) => {
  // === Basic Stats ===
  fastify.get('/api/stats', async (request, reply) => {
    try {
      const getTotalAgents = db.prepare('SELECT COUNT(*) as count FROM bots').get();
      const getActiveAgents = db.prepare("SELECT COUNT(*) as count FROM bots WHERE status = 'online'").get();
      const getTotalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get();
      const getTodayMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) = date('now')").get();

      return {
        totalAgents: getTotalAgents?.count || 0,
        activeAgents: getActiveAgents?.count || 0,
        totalMessages: getTotalMessages?.count || 0,
        todayMessages: getTodayMessages?.count || 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // === Message Trend Data ===
  fastify.get('/api/stats/trend', async (request, reply) => {
    try {
      const { days = 7 } = request.query;
      const daysNum = Math.min(Math.max(parseInt(days, 10) || 7, 1), 30);

      // Generate date series for the past N days
      const trendData = [];
      for (let i = daysNum - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;

        trendData.push({
          date: displayDate,
          fullDate: dateStr,
          messages: 0,
          botResponses: 0
        });
      }

      // Get message counts by date
      const messageCounts = db.prepare(`
        SELECT
          date(timestamp) as msg_date,
          COUNT(*) as count
        FROM messages
        WHERE date(timestamp) >= date('now', '-${daysNum} days')
        GROUP BY date(timestamp)
      `).all();

      // Get bot response counts (messages from bots)
      const botResponseCounts = db.prepare(`
        SELECT
          date(m.timestamp) as msg_date,
          COUNT(*) as count
        FROM messages m
        INNER JOIN bots b ON m.sender = b.id OR m.sender = b.name
        WHERE date(m.timestamp) >= date('now', '-${daysNum} days')
        GROUP BY date(m.timestamp)
      `).all();

      // Merge actual data into trend array
      messageCounts.forEach(row => {
        const idx = trendData.findIndex(t => t.fullDate === row.msg_date);
        if (idx !== -1) {
          trendData[idx].messages = row.count;
        }
      });

      botResponseCounts.forEach(row => {
        const idx = trendData.findIndex(t => t.fullDate === row.msg_date);
        if (idx !== -1) {
          trendData[idx].botResponses = row.count;
        }
      });

      return {
        data: trendData,
        period: `${daysNum} days`
      };
    } catch (error) {
      console.error('Error fetching trend data:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // === Agent Performance Ranking ===
  fastify.get('/api/stats/agents/performance', async (request, reply) => {
    try {
      const { limit = 10 } = request.query;
      const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

      // Get bot stats with bot info
      const performanceData = db.prepare(`
        SELECT
          b.id,
          b.name,
          b.status,
          b.avatar,
          COALESCE(bs.total_requests, 0) as requestCount,
          COALESCE(bs.total_tokens, 0) as totalTokens,
          bs.last_latency_ms as avgLatency,
          bs.last_active
        FROM bots b
        LEFT JOIN bot_stats bs ON b.id = bs.bot_id
        ORDER BY bs.total_requests DESC
        LIMIT ?
      `).all(limitNum);

      // Format response
      const agents = performanceData.map(bot => ({
        id: bot.id,
        name: bot.name || 'Unknown',
        status: bot.status,
        avatar: bot.avatar,
        requestCount: bot.requestCount || 0,
        totalTokens: bot.totalTokens || 0,
        avgLatency: bot.avgLatency || 0,
        lastActive: bot.last_active
      }));

      return {
        data: agents
      };
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // === API Usage Statistics ===
  fastify.get('/api/stats/api-usage', async (request, reply) => {
    try {
      const { days = 7 } = request.query;
      const daysNum = Math.min(Math.max(parseInt(days, 10) || 7, 1), 30);

      // Get usage by model from api_key_usage_logs
      const modelUsage = db.prepare(`
        SELECT
          model_name as name,
          SUM(request_count) as value,
          SUM(tokens_used) as tokens
        FROM api_key_usage_logs
        WHERE date(created_at) >= date('now', '-${daysNum} days')
          AND model_name IS NOT NULL
          AND model_name != ''
        GROUP BY model_name
        ORDER BY value DESC
        LIMIT 10
      `).all();

      // Get total stats
      const totalStats = db.prepare(`
        SELECT
          SUM(request_count) as totalRequests,
          SUM(tokens_used) as totalTokens,
          COUNT(DISTINCT api_key) as uniqueKeys
        FROM api_key_usage_logs
        WHERE date(created_at) >= date('now', '-${daysNum} days')
      `).get();

      // Get daily usage trend
      const dailyUsage = db.prepare(`
        SELECT
          date(created_at) as date,
          SUM(request_count) as requests,
          SUM(tokens_used) as tokens
        FROM api_key_usage_logs
        WHERE date(created_at) >= date('now', '-${daysNum} days')
        GROUP BY date(created_at)
        ORDER BY date
      `).all();

      return {
        modelDistribution: modelUsage.map(m => ({
          name: m.name,
          value: m.value || 0,
          tokens: m.tokens || 0
        })),
        totals: {
          requests: totalStats?.totalRequests || 0,
          tokens: totalStats?.totalTokens || 0,
          uniqueKeys: totalStats?.uniqueKeys || 0
        },
        dailyTrend: dailyUsage,
        period: `${daysNum} days`
      };
    } catch (error) {
      console.error('Error fetching API usage stats:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // === Dashboard Overview Stats ===
  fastify.get('/api/stats/dashboard', async (request, reply) => {
    try {
      // Get basic counts
      const totalAgents = db.prepare('SELECT COUNT(*) as count FROM bots').get()?.count || 0;
      const activeAgents = db.prepare("SELECT COUNT(*) as count FROM bots WHERE status = 'online'").get()?.count || 0;
      const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get()?.count || 0;
      const todayMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) = date('now')").get()?.count || 0;
      const yesterdayMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) = date('now', '-1 day')").get()?.count || 0;
      const weekMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) >= date('now', '-7 days')").get()?.count || 0;
      const lastWeekMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE date(timestamp) >= date('now', '-14 days') AND date(timestamp) < date('now', '-7 days')").get()?.count || 0;
      const totalApiCalls = db.prepare('SELECT COALESCE(SUM(request_count), 0) as count FROM api_key_usage_logs').get()?.count || 0;
      const avgLatencyRow = db.prepare('SELECT AVG(last_latency_ms) as avg FROM bot_stats WHERE last_latency_ms > 0').get();

      // Calculate growth percentages
      const messageGrowth = yesterdayMessages > 0
        ? Math.round(((todayMessages - yesterdayMessages) / yesterdayMessages) * 100)
        : 0;

      const weekGrowth = lastWeekMessages > 0
        ? Math.round(((weekMessages - lastWeekMessages) / lastWeekMessages) * 100)
        : 0;

      // Get new agents this week
      const newAgentsThisWeek = db.prepare(
        "SELECT COUNT(*) as count FROM bots WHERE date(created_at) >= date('now', '-7 days')"
      ).get()?.count || 0;

      return {
        overview: {
          totalAgents,
          activeAgents,
          onlineRate: totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0,
          newAgentsThisWeek
        },
        messages: {
          total: totalMessages,
          today: todayMessages,
          todayGrowth: messageGrowth,
          week: weekMessages,
          weekGrowth
        },
        api: {
          totalCalls: totalApiCalls,
          avgLatency: Math.round(avgLatencyRow?.avg || 0)
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
