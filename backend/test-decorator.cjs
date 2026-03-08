const Fastify = require('./node_modules/fastify');
const sqlite3 = require('./node_modules/sqlite3');

async function test() {
  console.log('Testing Fastify decorator with db...');
  
  const fastify = Fastify({ logger: false });
  
  // Initialize database
  const db = new sqlite3.Database(':memory:');
  
  // Decorate fastify
  fastify.decorate('db', db);
  
  console.log('Fastify instance created and decorated');
  
  // Register routes
  fastify.register(async (instance, opts) => {
    console.log('Route registration - instance:', !!instance);
    console.log('Route registration - instance.db:', !!instance.db);
    
    instance.get('/test', async (request, reply) => {
      console.log('Route handler - fastify:', !!instance);
      console.log('Route handler - fastify.db:', !!instance.db);
      
      return { 
        fastifyDb: !!instance.db, 
        dbValue: instance.db ? 'OK' : 'NULL' 
      };
    });
  });
  
  try {
    // Start server
    await fastify.listen({ port: 0, host: '127.0.0.1' });
    const address = fastify.server.address();
    const port = address.port;
    
    console.log(`Server listening on ${port}`);
    
    // Test the route
    const http = require('http');
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: '/test',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        console.log('Response body:', data);
        fastify.close();
        db.close();
      });
    });
    
    req.end();
    
  } catch (error) {
    console.error('Error:', error);
    if (db) db.close();
  }
}

test();
