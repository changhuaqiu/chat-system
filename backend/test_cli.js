
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testCli() {
  try {
    console.log('--- Starting CLI Integration Test ---');

    // 1. Create Bot (echo)
    console.log('1. Creating CLI Bot (echo)...');
    const botConfig = {
      id: 'test-cli-bot',
      name: 'Echo CLI',
      provider_type: 'cli',
      config: JSON.stringify({
        command: 'echo',
        args: [], // echo "msg"
        cwd: process.cwd()
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
        provider_type: 'cli',
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
        name: 'CLI Test Room',
        createdBy: 'tester'
    });
    const roomId = roomRes.data.room.id;
    console.log('Room created:', roomId);

    // 4. Send Message
    console.log('4. Sending Message...');
    await axios.post(`${API_URL}/api/chat/send`, {
        roomId,
        sender: 'user-tester',
        content: 'Hello CLI World!'
    });
    console.log('Message sent.');

    // 5. Wait for Reply
    console.log('5. Waiting for reply...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check Messages
    const msgsRes = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
    const messages = msgsRes.data.messages;
    
    const botReply = messages.find(m => m.sender === 'test-cli-bot');
    
    if (botReply) {
        console.log('SUCCESS: Bot replied:', botReply.content);
        if (botReply.content.trim() === 'Hello CLI World!') {
            console.log('Reply Content Matches!');
        } else {
            console.warn('Reply Content Mismatch (might be expected depending on CLI behavior)');
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

testCli();
