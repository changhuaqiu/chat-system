
const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('Starting verification...');

  // 1. GET /api/stats
  try {
    console.log('\n--- 1. GET /api/stats ---');
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(`GET /api/stats failed: ${res.statusText}`);
    const stats = await res.json();
    console.log('Response:', JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error GET /api/stats:', error.message);
  }

  // 2. GET /api/bots
  try {
    console.log('\n--- 2. GET /api/bots ---');
    const res = await fetch(`${BASE_URL}/api/bots`);
    if (!res.ok) throw new Error(`GET /api/bots failed: ${res.statusText}`);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error GET /api/bots:', error.message);
  }

  // 3. GET /api/logs
  try {
    console.log('\n--- 3. GET /api/logs ---');
    const res = await fetch(`${BASE_URL}/api/logs`);
    if (!res.ok) throw new Error(`GET /api/logs failed: ${res.statusText}`);
    const data = await res.json();
    // Truncate logs for display if too long
    if (data.logs && data.logs.length > 3) {
        console.log(`Response (first 3 logs of ${data.logs.length}):`, JSON.stringify(data.logs.slice(0, 3), null, 2));
    } else {
        console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error GET /api/logs:', error.message);
  }

  // 4. POST /api/api-keys
  const keyName = 'test-key-' + Date.now();
  const newKey = { name: keyName, environment: 'test', status: 'inactive' };
  let createdKeyData = null;
  try {
    console.log('\n--- 4. POST /api/api-keys ---');
    const res = await fetch(`${BASE_URL}/api/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKey)
    });
    if (!res.ok) throw new Error(`POST /api/api-keys failed: ${res.statusText}`);
    createdKeyData = await res.json();
    console.log('Response:', JSON.stringify(createdKeyData, null, 2));
  } catch (error) {
    console.error('Error POST /api/api-keys:', error.message);
  }

  // 5. GET /api/api-keys
  try {
    console.log('\n--- 5. GET /api/api-keys ---');
    const listRes = await fetch(`${BASE_URL}/api/api-keys`);
    if (!listRes.ok) throw new Error(`GET /api/api-keys failed: ${listRes.statusText}`);
    const keysData = await listRes.json();
    console.log('Response (keys count):', keysData.keys ? keysData.keys.length : 0);
    // console.log('Response:', JSON.stringify(keysData, null, 2));

    // Verify the created key
    if (createdKeyData) {
        const foundKey = keysData.keys.find(k => k.name === keyName);
        if (foundKey) {
             console.log(`Found key: ${foundKey.name}, Environment: ${foundKey.environment}`);
             if (foundKey.environment === 'test') {
                 console.log('✅ Verification SUCCESS: Key found with environment=test');
             } else {
                 console.error('❌ Verification FAILED: Key environment mismatch', foundKey.environment);
             }
        } else {
             console.error('❌ Verification FAILED: Key not found in list');
        }
    }

  } catch (error) {
    console.error('Error GET /api/api-keys:', error.message);
  }
}

testEndpoints();
