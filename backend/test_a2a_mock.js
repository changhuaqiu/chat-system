import { botService } from './src/services/botService.js';
import { db, initDb } from './src/db.js';

// Setup Mock DB and Bots
async function setup() {
    return new Promise((resolve) => {
        initDb();
        setTimeout(() => {
            // Create Mock Bots
            db.serialize(() => {
                db.run("DELETE FROM bots WHERE id LIKE 'mock-%'");
                
                // Bot A: The Requester
                db.run(`INSERT INTO bots (id, name, provider_type, config, status, description, capabilities) VALUES (
                    'mock-requester', 'Requester Bot', 'llm', '{"model":"mock-model"}', 'online', 'Asks for help', '["planning"]'
                )`);

                // Bot B: The Worker
                db.run(`INSERT INTO bots (id, name, provider_type, config, status, description, capabilities) VALUES (
                    'mock-worker', 'Worker Bot', 'llm', '{"model":"mock-model"}', 'online', 'Does work', '["coding"]'
                )`);
                
                resolve();
            });
        }, 1000);
    });
}

async function runTest() {
    await setup();
    console.log("--- Setup Complete ---");

    // Scenario: User mentions mock-requester
    console.log("\n--- Step 1: User -> Requester ---");
    const responses1 = await botService.handleMessage('test-room', 'user', 'Hello @mock-requester', null);
    console.log("Responses:", responses1.map(r => `${r.sender}: ${r.content}`));

    // Scenario: Requester mentions mock-worker (Simulated A2A)
    // We manually trigger this since we don't have the real loop running in this script
    console.log("\n--- Step 2: Requester -> Worker (Simulated A2A) ---");
    // Simulate Requester outputting a message mentioning Worker
    const requesterMsg = "I need help from @mock-worker";
    const responses2 = await botService.handleMessage('test-room', 'mock-requester', requesterMsg, null, [], false);
    console.log("Responses (No Mention Param):", responses2.map(r => `${r.sender}: ${r.content}`));
    
    // Now with mentions param (Simulating correct extraction)
    // Note: handleMessage logic for A2A relies on 'mentions' array or content parsing. 
    // Our updated logic checks content for @name too.
    const responses3 = await botService.handleMessage('test-room', 'mock-requester', requesterMsg, null, ['mock-worker'], false);
    console.log("Responses (With Mention Param):", responses3.map(r => `${r.sender}: ${r.content}`));

    // Scenario: Context Compression Test
    console.log("\n--- Step 3: Context Compression ---");
    // Create a long history
    const history = [];
    for(let i=0; i<15; i++) {
        history.push({ role: 'user', content: `Message ${i}` });
    }
    // Call generateResponse directly to see logs
    await botService.generateResponse('mock-worker', history, 'llm', { model: 'mock-model' });

}

runTest().catch(console.error);
