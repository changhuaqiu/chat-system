import { db, initDb } from './src/db.js';
import { eventBus } from './src/services/eventBus.js';
import { botService } from './src/services/botService.js'; // To ensure listener is started

async function setup() {
    return new Promise((resolve) => {
        initDb();
        setTimeout(() => {
            db.serialize(() => {
                // Delete existing python bot
                db.run("DELETE FROM bots WHERE id = 'python-analyst'");
                
                // Register Python Bot
                const config = JSON.stringify({
                    webhookUrl: "http://localhost:8001/events"
                });
                
                db.run(`INSERT INTO bots (id, name, provider_type, config, status, description, capabilities) VALUES (
                    'python-analyst', 'Python Analyst', 'webhook', ?, 'online', 'Analyzes data', '["analysis", "calculation"]'
                )`, [config]);
                
                console.log("Registered python-analyst bot");
                resolve();
            });
        }, 1000);
    });
}

async function runTest() {
    await setup();

    // Listen for response
    eventBus.on('message.created', (event) => {
        const { sender, content } = event.payload;
        console.log(`[EventBus] Received message from ${sender}: ${content}`);
        if (sender === 'python-analyst') {
            console.log("SUCCESS: Python Analyst replied!");
            process.exit(0);
        }
    });

    console.log("Sending message to python-analyst...");
    
    // Simulate User Message
    const payload = {
        id: 'test-msg-1',
        roomId: 'general',
        sender: 'user',
        content: '@python-analyst Please analyze market trends',
        mentions: ['python-analyst'],
        messageType: 'text',
        timestamp: new Date().toISOString()
    };
    
    // Publish
    await eventBus.publish('message.created', 'agent:user:test', 'room:general', payload);
    
    // Timeout
    setTimeout(() => {
        console.error("TIMEOUT: No response from Python Analyst");
        process.exit(1);
    }, 5000);
}

runTest().catch(console.error);
