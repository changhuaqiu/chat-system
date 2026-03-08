
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testReactions() {
  try {
    console.log('--- Testing Reactions ---');
    
    // 1. Create Room & Send Message
    const roomRes = await axios.post(`${API_URL}/api/rooms`, { name: 'Reaction Test Room' });
    const roomId = roomRes.data.room.id;
    
    const msgRes = await axios.post(`${API_URL}/api/chat/send`, {
        roomId,
        sender: 'tester',
        content: 'React to me!'
    });
    const msgId = msgRes.data.message.id;
    console.log('Message created:', msgId);

    // 2. Add Reaction
    console.log('Adding reaction...');
    const reactRes = await axios.post(`${API_URL}/api/messages/${msgId}/react`, {
        userId: 'tester',
        emoji: '❤️'
    });
    console.log('Reaction added:', reactRes.data);

    // 3. Fetch Messages & Verify Reaction
    console.log('Fetching messages...');
    const msgsRes = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`);
    const msg = msgsRes.data.messages.find(m => m.id === msgId);
    
    if (msg.reactions && msg.reactions.length > 0 && msg.reactions[0].emoji === '❤️') {
        console.log('SUCCESS: Reaction found on fetched message');
    } else {
        console.error('FAILURE: Reaction NOT found', msg.reactions);
    }

    // 4. Remove Reaction
    console.log('Removing reaction...');
    const unreactRes = await axios.post(`${API_URL}/api/messages/${msgId}/react`, {
        userId: 'tester',
        emoji: '❤️'
    });
    console.log('Reaction removed:', unreactRes.data);

  } catch (e) {
    console.error('Test failed:', e.message);
    if (e.response) console.error(e.response.data);
  }
}

testReactions();
