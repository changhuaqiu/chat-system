
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: '*'
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Root check
fastify.get('/', async (request, reply) => {
  return { message: 'OpenClaw Gateway Simulator' };
});

// Chat endpoint
fastify.post('/api/v1/sessions/:agentId/message', async (request, reply) => {
  const { agentId } = request.params;
  const { content } = request.body;
  
  console.log(`Received message for agent ${agentId}: ${content}`);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    content: `[OpenClaw Simulator] Agent ${agentId} received: "${content}"`,
    agentId
  };
});

// Mock LLM API
fastify.get('/v1/models', async (request, reply) => {
    return {
        data: [{ id: 'mock-gpt-4', object: 'model' }]
    };
});

fastify.post('/v1/chat/completions', async (request, reply) => {
    const { model, messages } = request.body;
    console.log(`[LLM Mock] Model: ${model}, Messages:`, messages);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const lastMsg = messages[messages.length - 1].content;
    
    return {
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Date.now(),
        choices: [{
            index: 0,
            message: {
                role: 'assistant',
                content: `[LLM Mock] I am ${model}. You said: "${lastMsg}"`
            },
            finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
    };
});

try {
  await fastify.listen({ port: 8000 });
  console.log('Mock OpenClaw Gateway running on http://localhost:8000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
