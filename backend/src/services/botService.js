import { db } from '../db.js';
import { botRuntime } from './botRuntime.js';
import { eventBus } from './eventBus.js';

export class BotService {
  constructor() {
    this.start();
    this.queue = [];
    this.activeExecutions = 0;
    this.MAX_CONCURRENT = 3; // Limit to 3 concurrent bots
  }

  start() {
    console.log('[BotService] Starting event listeners...');
    eventBus.on('message.created', this.onMessageCreated.bind(this));
  }

  /**
   * Event Handler: message.created
   */
  async onMessageCreated(event) {
    const { source, target, payload, metadata } = event;
    const { roomId, content, sender, mentions } = payload;

    // Ignore messages sent by bots (to prevent loops, unless we implement specific A2A logic later)
    // Actually, we DO want A2A. But we need to be careful.
    // Check source URN.
    // CRITICAL FIX: Only treat 'agent:user:' as human.
    // Previous logic: !source.startsWith('agent:bot:') was flawed because python-worker sends as 'agent:python-analyst'
    const isHuman = source.startsWith('agent:user:');

    // If source is a bot, we only reply if mentioned (A2A strict mode)
    // If source is human, we reply if mentioned OR free mode (depending on logic)

    // Parse Sender ID from URN
    // If agent:user:xxx -> xxx
    // If agent:xxx -> xxx
    const senderId = source.replace('agent:user:', '').replace('agent:', '');

    console.log(`[BotService] Received event ${event.id} from ${source} (isHuman: ${isHuman})`);
    console.log(`[BotService] Payload: roomId=${roomId}, sender=${sender}, mentions=${JSON.stringify(mentions)}, content="${content}"`);

    // 1. Fetch all online bots
    const bots = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM bots WHERE status = 'online'", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    console.log(`[BotService] Found ${bots.length} online bots: ${bots.map(b => b.id).join(', ')}`);

    // 2. Iterate bots to check trigger
    for (const bot of bots) {
        // Skip self
        if (bot.id === senderId) continue;

        let shouldTrigger = false;

        console.log(`[BotService] Checking bot ${bot.id} (name: ${bot.name})...`);

        if (isHuman) {
            // Free Mode or Mention Mode
            if (mentions && mentions.length > 0) {
                // If mentions exist, strict check
                if (mentions.includes(bot.id) || content.includes(`@${bot.name}`) || content.includes(`@${bot.id}`)) {
                    shouldTrigger = true;
                    console.log(`[BotService] ${bot.id} triggered by mention`);
                }
            } else {
                // Free Mode (No mentions -> All bots)
                shouldTrigger = true;
                console.log(`[BotService] ${bot.id} triggered in free mode`);
            }
        } else {
            // Bot-to-Bot: Strict Mention Only
            if (mentions && (mentions.includes(bot.id) || content.includes(`@${bot.name}`) || content.includes(`@${bot.id}`))) {

                // LOOP DETECTION: Check reply depth
                const depth = metadata?.depth || 0;
                const MAX_DEPTH = 2; // Max 2 replies in a chain

                if (depth >= MAX_DEPTH) {
                    console.warn(`[BotService] Loop detected! Stopping chain at depth ${depth} for ${bot.id}`);
                    shouldTrigger = false;
                } else {
                    shouldTrigger = true;
                    console.log(`[BotService] A2A Trigger: ${senderId} -> ${bot.id} (Depth: ${depth})`);
                }
            } else {
                console.log(`[BotService] ${bot.id} not triggered (no mention in A2A mode)`);
            }
        }

        if (shouldTrigger) {
            // Replaced direct trigger with queueing
            this.enqueueBot(bot, roomId, content, event.id, (metadata?.depth || 0) + 1);
        }
    }
  }

  enqueueBot(bot, roomId, content, replyToEventId, depth = 0) {
    console.log(`[BotService] Queueing bot ${bot.id} (Queue size: ${this.queue.length})`);
    this.queue.push({ bot, roomId, content, replyToEventId, depth });
    this.processQueue();
  }

  async processQueue() {
    if (this.activeExecutions >= this.MAX_CONCURRENT) {
        return;
    }

    if (this.queue.length === 0) {
        return;
    }

    const task = this.queue.shift();
    this.activeExecutions++;
    console.log(`[BotService] Processing task for bot ${task.bot.id} (Active: ${this.activeExecutions})`);

    try {
        await this.triggerBot(task.bot, task.roomId, task.content, task.replyToEventId, task.depth);
    } catch (error) {
        console.error(`[BotService] Error processing bot task:`, error);
    } finally {
        this.activeExecutions--;
        this.processQueue();
    }
  }

  async triggerBot(bot, roomId, content, replyToEventId, depth = 0) {
    console.log(`[BotService] Triggering bot ${bot.id} (Depth: ${depth})`);

    // Generate color if not set (consistent hash based on bot ID)
    let color = bot.color;
    if (!color) {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500'];
      const index = bot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      color = colors[index];
    }

    // 1. Publish Typing Started with bot info for UI display
    console.log(`[BotService] Publishing typing for bot ${bot.id} (name: ${bot.name})`);
    eventBus.publish('agent.typing', `agent:${bot.id}`, `room:${roomId}`, {
      roomId,
      userId: bot.id,
      userName: bot.name,
      avatar: bot.avatar,
      color
    });

    // 2. Execute Runtime
    const config = bot.config ? JSON.parse(bot.config) : {};
    
    // Check if Python Worker is needed (URN routing)
    // If bot.provider_type is 'webhook', BotRuntime handles it via WebhookAdaptor
    
    try {
        // We need conversation history. For now, just current message.
        // TODO: Fetch history from DB or EventStore
        const history = [{ role: 'user', content }];

        const result = await botRuntime.generateResponse(bot.id, history, bot.provider_type, config, {
            roomId
        });

        if (result.success) {
            // 3. Publish Response Event
            const responsePayload = {
                roomId,
                sender: bot.id,
                content: result.content,
                messageType: 'text', // or result.messageType
                timestamp: result.timestamp,
                replyToId: null, // We could link to replyToEventId if we map it to DB ID
                mentions: [], // Parse mentions from content?
                metadata: {
                    latency_ms: result.metrics?.latency,
                    provider: bot.provider_type,
                    model: config.model
                }
            };

            // URNs
            const sourceUrn = `agent:${bot.id}`;
            const targetUrn = `room:${roomId}`;

            await eventBus.publish('message.created', sourceUrn, targetUrn, responsePayload, {
                reply_to: replyToEventId,
                depth: depth // Propagate depth to next event
            });

            // 4. Update Stats
            this.updateBotStats(bot.id, 1, 0, result.metrics?.latency || 0);
        }
    } catch (error) {
        console.error(`[BotService] Error triggering bot ${bot.id}:`, error);
    } finally {
        // 5. Publish Typing Stopped with bot info for UI display
        eventBus.publish('agent.stopped_typing', `agent:${bot.id}`, `room:${roomId}`, {
            roomId,
            userId: bot.id,
            userName: bot.name,
            avatar: bot.avatar,
            color
        });
    }
  }

  updateBotStats(botId, requests = 1, tokens = 0, latency = 0) {
      db.run(`
          INSERT INTO bot_stats (bot_id, total_requests, total_tokens, last_latency_ms, last_active)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(bot_id) DO UPDATE SET
            total_requests = total_requests + ?,
            total_tokens = total_tokens + ?,
            last_latency_ms = ?,
            last_active = CURRENT_TIMESTAMP
      `, [botId, requests, tokens, latency, requests, tokens, latency], (err) => {
          if (err) console.error('Failed to update bot stats', err);
      });
  }

  async testConnection(providerType, config) {
    return botRuntime.testConnection(providerType, config);
  }

  /**
   * Legacy method compatibility
   * Used by server.js until fully refactored
   */
  async handleMessage(room, sender, content, io, mentions = [], isHuman = true) {
      // This is the legacy entry point.
      // We can redirect it to publish an event, OR just return empty promises if we rely on the event listener.
      // Since server.js calls this AND emits its own socket events, if we double-emit it might be duplicated.
      // 
      // STRATEGY:
      // If server.js is NOT updated yet (Task 3 not done), we need to keep this logic working.
      // But we want to use the new Runtime.
      // 
      // Let's make this method just publish the event!
      // But server.js expects a return value of responses to save to DB.
      // If we publish event, the event listener will trigger bot, which publishes another event.
      // The socket listener (if updated) will catch that.
      // 
      // PROBLEM: server.js lines 90-106 wait for `responses` and save them to DB.
      // If we change this to async event, `responses` will be empty.
      // server.js won't save bot responses.
      // BUT, `onMessageCreated` -> `triggerBot` -> `eventBus.publish('message.created')`.
      // Who saves the bot response to DB?
      // `EventBus` persists ALL events to `events` table.
      // But we also need them in `messages` table for the frontend history.
      // 
      // Solution: Add a listener for `message.created` that syncs to `messages` table?
      // Or modify `EventBus` to write to `messages` table too?
      // Or, for now, let `BotService` write to `messages` table inside `triggerBot`?
      
      // Let's publish the event here to trigger the new flow.
      // And return empty array to legacy caller so it doesn't do anything double.
      
      const sourceUrn = isHuman ? `agent:user:${sender}` : `agent:${sender}`;
      const targetUrn = `room:${room}`;
      
      const payload = { roomId: room, sender, content, mentions };
      
      // Publish event to trigger the chain
      // Note: This assumes the USER message is already saved by server.js (it is).
      // We are just triggering the bots.
      await eventBus.publish('message.created', sourceUrn, targetUrn, payload);
      
      return []; // Legacy caller gets nothing, relies on EventBus -> Socket/DB flow.
  }
}

export const botService = new BotService();
