import axios from 'axios';
import BotAdaptor from './BotAdaptor.js';

export default class LlmAdaptor extends BotAdaptor {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async initialize() {
    console.log(`[LlmAdaptor] Initializing with model: ${this.model} (${this.baseUrl})`);
    if (!this.apiKey) {
        console.warn('[LlmAdaptor] No API Key provided, requests might fail.');
    }
    return true;
  }

  async chat(content, context) {
    if (!this.apiKey) throw new Error('API Key is missing');

    const MAX_RETRIES = 2;
    const TIMEOUT = 60000; // 60s timeout for better reliability

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
            `${this.baseUrl}/chat/completions`,
            {
                model: this.model,
                messages: context.history || [{ role: 'user', content }],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: TIMEOUT
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error('Invalid response format from LLM provider');
        }
      } catch (error) {
        // Retry on timeout or network errors
        if (attempt < MAX_RETRIES && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
          console.warn(`[LlmAdaptor] Request timed out, retrying... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          continue;
        }
        console.error(`[LlmAdaptor] Error calling LLM API (${this.model}):`, error.message);
        throw error;
      }
    }

    throw new Error('Failed after retries');
  }

  async checkStatus() {
    if (this.model === 'mock-model') return 'online';
    try {
        // Try to list models as a health check
        await axios.get(`${this.baseUrl}/models`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` },
            timeout: 5000
        });
        return 'online';
    } catch (e) {
        console.warn(`[LlmAdaptor] /models check failed: ${e.message}. Trying chat completion fallback...`);

        // If /models fails (common with some providers like Aliyun compatible mode sometimes),
        // try a minimal chat completion to verify access.
        try {
            await axios.post(`${this.baseUrl}/chat/completions`, {
                model: this.model,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            return 'online';
        } catch (chatError) {
            console.error(`[LlmAdaptor] Fallback chat check failed: ${chatError.message}`);
            if (chatError.response) {
                 return `error: ${chatError.response.status} - ${JSON.stringify(chatError.response.data)}`;
            }
            return `error: ${chatError.message}`;
        }
    }
  }

  /**
   * Test connection by sending a real "hello" message
   * This provides a more realistic connectivity test than checkStatus
   */
  async testConnection() {
    if (!this.apiKey) {
      return { success: false, error: 'API Key 缺失' };
    }

    try {
      const response = await this.chat('hello', {
        history: [{ role: 'user', content: 'hello' }]
      });

      if (response) {
        return {
          success: true,
          response: response,
          message: '连接测试成功！已收到回复。'
        };
      } else {
        return {
          success: false,
          error: '未收到有效回复'
        };
      }
    } catch (error) {
      console.error('[LlmAdaptor] Test connection failed:', error.message);
      return {
        success: false,
        error: error.message || '测试失败'
      };
    }
  }
}
