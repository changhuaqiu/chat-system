import axios from 'axios';
import BotAdaptor from './BotAdaptor.js';

export default class OpenClawAdaptor extends BotAdaptor {
  async initialize() {
    console.log(`[OpenClawAdaptor] Connecting to gateway: ${this.config.gateway}`);
    
    if (!this.config.gateway) throw new Error('Gateway URL is required');
    if (!this.config.agentId) throw new Error('Agent ID is required');

    // Check if gateway is reachable
    try {
      const status = await this.checkStatus();
      if (status === 'offline') throw new Error('Gateway unreachable or Agent not found');
      return true;
    } catch (e) {
      console.error('[OpenClawAdaptor] Init failed:', e.message);
      throw e;
    }
  }

  async chat(content, context) {
    // Call OpenClaw Gateway API
    // POST /api/v1/sessions/{agentId}/message
    const { gateway, agentId } = this.config;
    try {
        // Use standard OpenClaw endpoint structure or user provided
        // Assuming: POST /api/v1/chat/completions (OpenAI compatible) or custom
        // Let's use the one from previous code comments as a starting point:
        // /api/v1/sessions/${agentId}/message seems specific to some implementation.
        // Let's try a generic approach if possible, or stick to what was hinted.
        // Given "OpenClaw", let's assume it exposes an OpenAI-compatible interface at /v1/chat/completions
        // or a specific agent endpoint.
        
        // Let's use a generic POST to the gateway + agent path
        // If gateway is "http://localhost:8000", we might need to append path.
        // Let's assume gateway includes the full base URL.
        
        // Strategy: Try to send to `${gateway}/api/v1/chat` or similar.
        // But better: use the exact path from previous context:
        // `${gateway}/api/v1/sessions/${agentId}/message`
        
        const response = await axios.post(`${gateway}/api/v1/sessions/${agentId}/message`, {
            content: content,
            sessionId: context.sessionId || 'default-session'
        }, {
            timeout: 30000 // 30s timeout
        });

        // Extract content from response
        // Assuming response.data.content or response.data.message
        return response.data.content || response.data.message || JSON.stringify(response.data);
    } catch (e) {
        console.error(`[OpenClawAdaptor] Chat failed: ${e.message}`);
        if (e.response) {
            throw new Error(`OpenClaw Error: ${e.response.status} ${JSON.stringify(e.response.data)}`);
        }
        throw new Error(`OpenClaw call failed: ${e.message}`);
    }
  }

  async checkStatus() {
    const { gateway, agentId } = this.config;
    try {
        // Try to hit a health endpoint or info endpoint
        // GET /api/v1/agents/${agentId} or just GET /health
        await axios.get(`${gateway}/health`, { timeout: 5000 });
        return 'online';
    } catch (e) {
        // Fallback: try root
        try {
            await axios.get(`${gateway}/`, { timeout: 5000 });
            return 'online';
        } catch (e2) {
            return 'offline';
        }
    }
  }
}
