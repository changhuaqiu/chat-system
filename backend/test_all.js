
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testAll() {
  try {
    console.log('--- Starting Integration Test (All Bots) ---');

    // 1. Check Bots
    console.log('1. Checking Bots...');
    const botsRes = await axios.get(`${API_URL}/api/bots`);
    const bots = botsRes.data.bots;
    const testBots = ['test-openclaw-bot', 'test-cli-bot', 'test-llm-bot'];
    
    const missing = testBots.filter(id => !bots.find(b => b.id === id));
    if (missing.length > 0) {
        console.error('Missing test bots:', missing);
        console.log('Please run individual test scripts first.');
        process.exit(1);
    }
    console.log('All test bots present.');

    // 2. Create Room
    console.log('2. Creating Room...');
    const roomRes = await axios.post(`${API_URL}/api/rooms`, {
        name: 'Integration Test Room',
        createdBy: 'tester'
    });
    const roomId = roomRes.data.room.id;
    console.log('Room created:', roomId);

    // 3. Send Message
    console.log('3. Sending Message...');
    await axios.post(`${API_URL}/api/chat/send`, {
        roomId,
        sender: 'user-tester',
        content: 'Hello Everyone!'
    });
    console.log('Message sent.');

    // 4. Wait for Replies
    console.log('4. Waiting for replies...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Check Messages
    const msgsRes = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
    const messages = msgsRes.data.messages;
    
    let successCount = 0;
    for (const botId of testBots) {
        const reply = messages.find(m => m.sender === botId);
        if (reply) {
            console.log(`SUCCESS: ${botId} replied:`, reply.content.substring(0, 50));
            successCount++;
        } else {
            console.error(`FAILURE: ${botId} did not reply.`);
        }
    }

    // 6. Check Stats
    console.log('6. Checking Stats...');
    const newBotsRes = await axios.get(`${API_URL}/api/bots`);
    const newBots = newBotsRes.data.bots;
    
    for (const botId of testBots) {
        const bot = newBots.find(b => b.id === botId);
        console.log(`Bot ${botId} Stats: Requests=${bot.stats.requests}, Latency=${bot.stats.latency}ms`);
        if (bot.stats.requests > 0) {
            console.log(`Stats updated for ${botId}`);
        } else {
            console.warn(`Stats NOT updated for ${botId}`);
        }
    }

    if (successCount === 3) {
        console.log('--- ALL TESTS PASSED ---');
    } else {
        console.error(`--- TEST FAILED (${successCount}/3 bots replied) ---`);
    }

  } catch (e) {
    console.error('Test failed:', e.message);
    if (e.response) console.error(e.response.data);
  }
}

testAll();
