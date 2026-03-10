import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { botsRoutes } from './routes/bots.js';
import { apiKeysRoutes } from './routes/apiKeys.js';
import logsRoutes from './routes/logs.js';
import { agentsRoutes } from './routes/agents.js';
import { roomsRoutes } from './routes/rooms.js';
import { emojiRoutes } from './routes/emoji.js';
import { messageRoutes } from './routes/messages.js';
import { statsRoutes } from './routes/stats.js';
import { characterCardsRoutes } from './routes/character-cards.js';
import { worldInfoRoutes } from './routes/world-info.js';
import { quotaRoutes } from './routes/quota.js';
import agentService from "./services/agentService.js";
import { botService } from './services/botService.js';
import { eventBus } from './services/eventBus.js';
import { db, initDb } from './db.js';
import loggerService from './services/loggerService.js';

// Load environment variables BEFORE any service initialization
dotenv.config();

const fastify = Fastify({ logger: false });

// Initialize Database Tables
initDb();
loggerService.info('system', 'Database initialized');

fastify.decorate('db', db);
fastify.decorate('eventBus', eventBus);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root directory (one level up from src)
const rootDir = path.join(__dirname, '..');

fastify.register(cors, { origin: "*" });

// Serve uploaded images
fastify.register(fastifyStatic, {
  root: path.join(rootDir, 'data', 'emojis'),
  prefix: '/uploads/',
  decorateReply: false // fastify-static v5+
});

fastify.register(botsRoutes);
fastify.register(apiKeysRoutes);
fastify.register(quotaRoutes);
fastify.register(agentsRoutes);
fastify.register(roomsRoutes);
fastify.register(emojiRoutes);
fastify.register(messageRoutes);
fastify.register(logsRoutes);
fastify.register(statsRoutes);
fastify.register(characterCardsRoutes);
fastify.register(worldInfoRoutes);

agentService.initialize().then(() => {
  console.log("Agent service initialized successfully");
}).catch((err) => {
  console.error("Failed to initialize agent service:", err);
});

fastify.get('/', () => ({ message: 'Chat System API', version: '1.0.0' }));
fastify.get('/health', () => ({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${PORT}`);
    loggerService.info('system', `Server started on port ${PORT}`);

    // Create Socket.io server
    const io = new Server(fastify.server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    fastify.io = io;

    // --- Event Bus Listeners ---

    // 1. Broadcast Message to Clients & Persist to Messages Table
    eventBus.on('message.created', async (event) => {
        const { payload } = event;
        const { id, roomId, sender, content, mentions, messageType, mediaUrl, timestamp, replyToId, metadata } = payload;

        console.log(`[Server] Processing message.created: ${id} from ${sender}`);
        loggerService.info('server', `Processing message from ${sender}`, { messageId: id, roomId });

        // Persist to 'messages' table (Frontend History)
        // We use INSERT OR IGNORE or similar logic if ID exists, but sqlite doesn't support IGNORE easily without unique constraint.
        // ID is primary key, so INSERT OR IGNORE works.
        try {
          db.prepare(
            'INSERT OR IGNORE INTO messages (id, room_id, sender, content, mentions, message_type, media_url, timestamp, reply_to_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).run(
            [id, roomId, sender, content, JSON.stringify(mentions || []), messageType, mediaUrl, timestamp, replyToId, JSON.stringify(metadata || {})]
          );
          // Broadcast to Room
          io.to(roomId).emit('messageReceived', payload);
        } catch (err) {
          console.error('Error persisting message:', err);
          loggerService.error('database', 'Error persisting message', { error: err.message, messageId: id });
        }
    });

    // 2. Typing Indicators - Forward full typing info to clients
    eventBus.on('agent.typing', (event) => {
        const { roomId, userId, userName, avatar, color } = event.payload;
        io.to(roomId).emit('typing', { user: userId, userName, avatar, color });
    });

    eventBus.on('agent.stopped_typing', (event) => {
        const { roomId, userId } = event.payload;
        io.to(roomId).emit('stopTyping', { user: userId });
    });


    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // === 心跳处理 ===
      socket.on('heartbeat', (data) => {
        socket.emit('heartbeat_ack', { timestamp: data.timestamp, serverTime: Date.now() });
      });

      socket.on('joinRoom', ({ room }) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on('typing', ({ room, user }) => {
        socket.to(room).emit('typing', { user });
      });

      socket.on('stopTyping', ({ room, user }) => {
        socket.to(room).emit('stopTyping', { user });
      });

      // Legacy Socket Event - Converted to Event Bus
      socket.on('sendMessage', async (data) => {
        const { room, sender, content, mentions = [], messageType = 'text', mediaUrl = null, replyToId = null, metadata = {} } = data;
        const messageId = Date.now().toString();
        const timestamp = new Date().toISOString();

        const payload = {
             id: messageId, roomId: room, sender, content, mentions,
             messageType, mediaUrl, timestamp, replyToId, metadata
        };

        const sourceUrn = sender === 'user' ? `agent:user:${sender}` : `agent:${sender}`;
        const targetUrn = `room:${room}`;

        // Publish to Event Bus
        await eventBus.publish('message.created', sourceUrn, targetUrn, payload);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    console.log(`WebSocket server ready on ws://localhost:${PORT}`);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
