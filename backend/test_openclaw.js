
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const GATEWAY_URL = 'http://localhost:8000';

async function testOpenClaw() {
  try {
    console.log('--- Starting OpenClaw Integration Test ---');

    // 1. Create Bot
    console.log('1. Creating OpenClaw Bot...');
    const botConfig = {
      id: 'test-openclaw-bot',
      name: 'OpenClaw Tester',
      provider_type: 'openclaw',
      config: JSON.stringify({
        gateway: GATEWAY_URL,
        agentId: 'tester-agent'
      }),
      status: 'online'
    };
    
    // Check if exists first
    try {
        await axios.delete(`${API_URL}/api/bots/${botConfig.id}`);
    } catch (e) {}

    await axios.post(`${API_URL}/api/bots`, botConfig);
    console.log('Bot created.');

    // 2. Test Connection
    console.log('2. Testing Connection...');
    const testRes = await axios.post(`${API_URL}/api/bots/test`, {
        provider_type: 'openclaw',
        config: JSON.parse(botConfig.config)
    });
    
    if (testRes.data.success) {
        console.log('Connection test passed:', testRes.data);
    } else {
        console.error('Connection test failed:', testRes.data);
        process.exit(1);
    }

    // 3. Create Room
    console.log('3. Creating Room...');
    const roomRes = await axios.post(`${API_URL}/api/rooms`, {
        name: 'OpenClaw Test Room',
        createdBy: 'tester'
    });
    const roomId = roomRes.data.room.id;
    console.log('Room created:', roomId);

    // 4. Send Message
    console.log('4. Sending Message...');
    await axios.post(`${API_URL}/api/chat/send`, {
        roomId,
        sender: 'user-tester',
        content: 'Hello OpenClaw!'
    });
    console.log('Message sent.');

    // 5. Wait for Reply
    console.log('5. Waiting for reply...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check Messages
    const msgsRes = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
    const messages = msgsRes.data.messages;
    
    const botReply = messages.find(m => m.sender === 'test-openclaw-bot');
    
    if (botReply) {
        console.log('SUCCESS: Bot replied:', botReply.content);
        console.log('Reply Content Matches?', botReply.content.includes('Echo: Hello OpenClaw!') || botReply.content.includes('received'));
    } else {
        console.error('FAILURE: Bot did not reply.');
        console.log('Messages:', messages);
    }

  } catch (e) {
    console.error('Test failed:', e.message);
    if (e.response) console.error(e.response.data);
  }
}

testOpenClaw();
