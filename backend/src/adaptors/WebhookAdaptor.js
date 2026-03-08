import axios from 'axios';
import BotAdaptor from './BotAdaptor.js';

export default class WebhookAdaptor extends BotAdaptor {
  constructor(config) {
    super(config);
    this.webhookUrl = config.webhookUrl;
    this.apiKey = config.apiKey; // Optional, for auth header
  }

  async initialize() {
    console.log(`[WebhookAdaptor] Initializing with URL: ${this.webhookUrl}`);
    if (!this.webhookUrl) {
        throw new Error('Webhook URL is required');
    }
    return true;
  }

  async chat(content, context) {
    try {
        // Prepare event payload for the worker
        const payload = {
            content,
            context,
            timestamp: new Date().toISOString()
        };

        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await axios.post(this.webhookUrl, payload, {
            headers,
            timeout: 60000 // Long timeout for worker processing
        });

        if (response.data && response.data.content) {
            return response.data.content;
        } else {
            // Some workers might just return status 200 and reply asynchronously via Event Bus.
            // If so, we might return a placeholder or null if the architecture allows.
            // For this sync-like `chat` interface, we expect a response.
            // If the worker is async, we might need to change `chat` to return null and handle async reply later.
            // But for now let's assume request-response for simplicity or the worker waits.
            return response.data.content || "Ack";
        }
    } catch (error) {
        console.error(`[WebhookAdaptor] Error calling webhook:`, error.message);
        throw error;
    }
  }

  async checkStatus() {
    try {
        await axios.get(this.webhookUrl.replace('/events', '/health'), { timeout: 5000 });
        return 'online';
    } catch (e) {
        return 'offline';
    }
  }
}
