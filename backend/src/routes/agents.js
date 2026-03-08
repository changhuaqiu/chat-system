/**
 * OpenClaw Gateway Agent Routes for Fastify
 * 提供与 OpenClaw Agent 通信的 RESTful API
 */

import agentService from '../services/agentService.js';

/**
 * Get all agents list
 * GET /agents
 */
async function getAgents(request, reply) {
  try {
    const agents = agentService.getAllAgents();
    reply.send({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    reply.code(500).send({ success: false, error: error.message });
  }
}

/**
 * Get specific agent info
 * GET /agents/:agentId
 */
async function getAgent(request, reply) {
  try {
    const { agentId } = request.params;
    const agent = agentService.getAgent(agentId);
    
    if (!agent) {
      return reply.code(404).send({ success: false, error: 'Agent not found' });
    }
    
    reply.send({ success: true, agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    reply.code(500).send({ success: false, error: error.message });
  }
}

/**
 * Send message to agent
 * POST /agents/:agentId/message
 */
async function sendMessageToAgent(request, reply) {
  try {
    const { agentId } = request.params;
    const { message } = request.body;
    
    if (!message) {
      return reply.code(400).send({ success: false, error: 'Message is required' });
    }
    
    const result = agentService.sendMessage(agentId, message);
    
    if (result.success) {
      reply.send({ success: true, ...result });
    } else {
      reply.code(404).send({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    reply.code(500).send({ success: false, error: error.message });
  }
}

/**
 * Broadcast message to all agents
 * POST /agents/broadcast
 */
async function broadcastMessage(request, reply) {
  try {
    const { message } = request.body;
    
    if (!message) {
      return reply.code(400).send({ success: false, error: 'Message is required' });
    }
    
    const results = agentService.broadcastMessage(message);
    reply.send({ success: true, results });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    reply.code(500).send({ success: false, error: error.message });
  }
}

/**
 * Heartbeat check
 * GET /agents/heartbeat
 */
async function checkHeartbeats(request, reply) {
  try {
    const inactiveAgents = agentService.checkHeartbeats(60000);
    reply.send({ 
      success: true, 
      totalAgents: agentService.getAllAgents().length,
      inactiveAgents: inactiveAgents.length,
      inactiveAgentIds: inactiveAgents
    });
  } catch (error) {
    console.error('Error checking heartbeats:', error);
    reply.code(500).send({ success: false, error: error.message });
  }
}

// 导出路由注册函数
export function agentsRoutes(fastify, options, done) {
  fastify.get('/agents', getAgents);
  fastify.get('/agents/:agentId', getAgent);
  fastify.post('/agents/:agentId/message', sendMessageToAgent);
  fastify.post('/agents/broadcast', broadcastMessage);
  fastify.get('/agents/heartbeat', checkHeartbeats);
  
  done();
}
