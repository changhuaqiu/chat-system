import { db, initDb } from './src/db.js';
import { eventBus } from './src/services/eventBus.js';
import { botService } from './src/services/botService.js';

async function setup() {
    return new Promise((resolve) => {
        initDb();
        setTimeout(() => {
            db.serialize(() => {
                // Delete bots
                db.run("DELETE FROM bots WHERE id IN ('bot-a', 'bot-b')");
                
                // Create Bot A (Echo Bot)
                const config = JSON.stringify({ model: 'mock-model' });
                db.run(`INSERT INTO bots (id, name, provider_type, config, status, description, capabilities) VALUES (
                    'bot-a', 'Bot A', 'llm', ?, 'online', 'Echo Bot A', '["chat"]'
                )`, [config]);

                // Create Bot B (Echo Bot)
                db.run(`INSERT INTO bots (id, name, provider_type, config, status, description, capabilities) VALUES (
                    'bot-b', 'Bot B', 'llm', ?, 'online', 'Echo Bot B', '["chat"]'
                )`, [config]);
                
                console.log("Registered Bot A and Bot B");
                resolve();
            });
        }, 1000);
    });
}

// Mock Runtime to force replies with mentions
import { botRuntime } from './src/services/botRuntime.js';

botRuntime.generateResponse = async (botId, history) => {
    // Determine who to reply to
    const target = botId === 'bot-a' ? '@bot-b' : '@bot-a';
    return {
        success: true,
        content: `Hello ${target}, this is a reply from ${botId}`,
        timestamp: new Date().toISOString(),
        metrics: { latency: 10 }
    };
};

async function runTest() {
    await setup();

    let replyCount = 0;
    eventBus.on('message.created', (event) => {
        const { sender, content, metadata } = event.payload;
        // Check depth from event metadata (not payload metadata, but event wrapper metadata)
        const depth = event.metadata?.depth || 0;
        
        console.log(`[EventBus] ${sender}: ${content} (Depth: ${depth})`);
        
        if (sender.startsWith('bot-')) {
            replyCount++;
        }
    });

    console.log("Starting Loop Test: User -> @bot-a");
    
    // User triggers Bot A
    const payload = {
        id: 'init-msg',
        roomId: 'loop-test',
        sender: 'user',
        content: 'Start loop @bot-a',
        mentions: ['bot-a'],
        messageType: 'text',
        timestamp: new Date().toISOString()
    };
    
    // Publish initial message
    await eventBus.publish('message.created', 'agent:user:tester', 'room:loop-test', payload);
    
    // Wait for loop to run and stop
    setTimeout(() => {
        console.log(`Test Finished. Total Bot Replies: ${replyCount}`);
        // Expect:
        // 1. User -> Bot A (Depth 0) -> Triggers Bot A (Depth 1)
        // 2. Bot A -> Bot B (Depth 1) -> Triggers Bot B (Depth 2)
        // 3. Bot B -> Bot A (Depth 2) -> Triggers Bot A (Depth 3) -> STOPPED (Max Depth 2)
        // Wait, logic says: if depth >= MAX_DEPTH (2), stop.
        // So Bot B (Depth 2) message arrives. BotService sees depth=2. 2 >= 2 is True. STOP.
        // So Bot A should NOT be triggered again.
        
        if (replyCount <= 4) {
             console.log("SUCCESS: Loop contained.");
             process.exit(0);
        } else {
             console.error("FAILURE: Loop ran too long!");
             process.exit(1);
        }
    }, 5000);
}

runTest().catch(console.error);
