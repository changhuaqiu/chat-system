
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const MOCK_LLM_URL = 'http://localhost:8000/v1';

async function testLlm() {
  try {
    console.log('--- Starting LLM Integration Test ---');

    // 1. Create Bot
    console.log('1. Creating LLM Bot...');
    const botConfig = {
      id: 'test-llm-bot',
      name: 'LLM Tester',
      provider_type: 'llm',
      config: JSON.stringify({
        model: 'mock-gpt-4',
        apiKey: 'mock-key',
        baseUrl: MOCK_LLM_URL
      }),
      status: 'online'
    };
    
    try {
        await axios.delete(`${API_URL}/api/bots/${botConfig.id}`);
    } catch (e) {}

    await axios.post(`${API_URL}/api/bots`, botConfig);
    console.log('Bot created.');

    // 2. Test Connection
    console.log('2. Testing Connection...');
    const testRes = await axios.post(`${API_URL}/api/bots/test`, {
        provider_type: 'llm',
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
        name: 'LLM Test Room',
        createdBy: 'tester'
    });
    const roomId = roomRes.data.room.id;
    console.log('Room created:', roomId);

    // 4. Send Message
    console.log('4. Sending Message...');
    await axios.post(`${API_URL}/api/chat/send`, {
        roomId,
        sender: 'user-tester',
        content: 'Hello LLM!'
    });
    console.log('Message sent.');

    // 5. Wait for Reply
    console.log('5. Waiting for reply...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check Messages
    const msgsRes = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
    const messages = msgsRes.data.messages;
    
    const botReply = messages.find(m => m.sender === 'test-llm-bot');
    
    if (botReply) {
        console.log('SUCCESS: Bot replied:', botReply.content);
        if (botReply.content.includes('[LLM Mock]')) {
            console.log('Reply Content Matches!');
        } else {
            console.warn('Reply Content Mismatch');
        }
    } else {
        console.error('FAILURE: Bot did not reply.');
        console.log('Messages:', messages);
    }

  } catch (e) {
    console.error('Test failed:', e.message);
    if (e.response) console.error(e.response.data);
  }
}

testLlm();
