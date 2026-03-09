import { db } from '../db.js';
import LlmAdaptor from '../adaptors/LlmAdaptor.js';
import OpenClawAdaptor from '../adaptors/OpenClawAdaptor.js';
import CliAdaptor from '../adaptors/CliAdaptor.js';
import WebhookAdaptor from '../adaptors/WebhookAdaptor.js';
import { YAMLLoader } from './loaders/YAMLLoader.js';
import { worldInfoManager } from './WorldInfoManager.js';

export class BotRuntime {
  constructor() {
    // Map<botId, BotAdaptor>
    this.adaptors = new Map();
    this.cardLoader = new YAMLLoader();
  }

  /**
   * Get or create a bot adaptor instance
   */
  async getAdaptor(botId, providerType, config) {
    if (this.adaptors.has(botId)) {
      return this.adaptors.get(botId);
    }

    let adaptor;
    switch (providerType) {
      case 'llm':
      case 'openai':
      case 'alibaba':
      case 'deepseek':
      case 'anthropic':
      case 'oneapi':
        adaptor = new LlmAdaptor(config);
        break;
      case 'openclaw':
        adaptor = new OpenClawAdaptor(config);
        break;
      case 'cli':
        adaptor = new CliAdaptor(config);
        break;
      case 'webhook':
        adaptor = new WebhookAdaptor(config);
        break;
      default:
        console.warn(`Unknown provider type: ${providerType}, falling back to LLM`);
        adaptor = new LlmAdaptor(config);
    }

    await adaptor.initialize();
    this.adaptors.set(botId, adaptor);
    return adaptor;
  }

  /**
   * Test connection for a bot configuration
   */
  async testConnection(providerType, config) {
    let adaptor;
    switch (providerType) {
      case 'llm':
      case 'openai':
      case 'alibaba':
      case 'deepseek':
      case 'anthropic':
      case 'oneapi':
        adaptor = new LlmAdaptor(config);
        break;
      case 'openclaw':
        adaptor = new OpenClawAdaptor(config);
        break;
      case 'cli':
        adaptor = new CliAdaptor(config);
        break;
      case 'webhook':
        adaptor = new WebhookAdaptor(config);
        break;
      default:
        // Fallback for unknown providers during test as well
        console.warn(`Unknown provider type: ${providerType}, falling back to LLM for test`);
        adaptor = new LlmAdaptor(config);
    }

    try {
        await adaptor.initialize();
        // Call testConnection to send a real "hello" message for testing
        const result = await adaptor.testConnection();
        return result;
    } catch (e) {
        return { success: false, error: e.message };
    }
  }

  /**
   * Build system prompt with character card, world info, and agent registry
   */
  async buildSystemPrompt(botId, card, worldInfo, agentRegistry) {
    const parts = [];

    // 1. Character Card System Prompt
    if (card) {
      // Custom system prompt from card takes priority
      if (card.system_prompt) {
        parts.push(card.system_prompt);
      }

      // Build character persona
      const personaParts = [];

      if (card.name) {
        personaParts.push(`You are ${card.name}.`);
      }

      if (card.personality) {
        personaParts.push(`Personality: ${card.personality}`);
      }

      if (card.description) {
        personaParts.push(`Description: ${card.description}`);
      }

      if (card.scenario) {
        personaParts.push(`Current Scenario: ${card.scenario}`);
      }

      if (personaParts.length > 0) {
        parts.push(`[Character Persona]\n${personaParts.join('\n')}`);
      }

      // Speaking style from extensions
      if (card.extensions?.speakingStyle) {
        const style = card.extensions.speakingStyle;
        const styleParts = [];

        if (style.tone) {
          const toneMap = {
            formal: 'Use formal, professional language',
            casual: 'Use casual, conversational language',
            cute: 'Use cute, playful language with emojis',
            professional: 'Maintain a professional, expert tone',
            neutral: 'Use neutral, balanced language'
          };
          styleParts.push(toneMap[style.tone] || `Use ${style.tone} tone`);
        }

        if (style.emojiUsage === 'none') {
          styleParts.push('Avoid using emojis');
        } else if (style.emojiUsage === 'frequent') {
          styleParts.push('Use emojis frequently');
        } else if (style.emojiUsage === 'sparse') {
          styleParts.push('Use emojis sparingly');
        }

        if (style.sentenceLength === 'short') {
          styleParts.push('Keep sentences short and concise');
        } else if (style.sentenceLength === 'long') {
          styleParts.push('Use longer, more detailed sentences');
        }

        if (styleParts.length > 0) {
          parts.push(`[Speaking Style]\n${styleParts.join('. ')}`);
        }
      }

      // Example dialogues (Few-Shot)
      if (card.mes_example) {
        const examples = card.mes_example.split('<START>').filter(s => s.trim());
        if (examples.length > 0) {
          parts.push(`[Example Dialogues]\n${examples.join('\n')}`);
        }
      }

      // Post-history instructions
      if (card.post_history_instructions) {
        parts.push(`[Additional Instructions]\n${card.post_history_instructions}`);
      }
    }

    // 2. Agent Registry
    if (agentRegistry) {
      parts.push(`[Agents in Room]\n${agentRegistry}`);
    }

    // 3. World Info
    if (worldInfo) {
      parts.push(worldInfo);
    }

    return parts.join('\n\n');
  }

  /**
   * Get formatted agent registry for system prompt
   */
  getAgentRegistry(excludeBotId) {
    const rows = db.prepare("SELECT id, name, description, capabilities FROM bots WHERE status = 'online'").all();

    const agents = rows.filter(b => b.id !== excludeBotId).map(b => {
        let caps = b.capabilities;
        try {
            if (caps && typeof caps === 'string') caps = JSON.parse(caps);
        } catch (e) {}

        return `- @${b.id} (${b.name}): ${b.description || 'No description'} [Capabilities: ${Array.isArray(caps) ? caps.join(', ') : (caps || 'None')}]`;
    });

    if (agents.length === 0) return "You are the only agent in this room.";

    return `You are in a chatroom with other agents. You can ask them for help by explicitly mentioning them (e.g. "@agent_id").\nAvailable Agents:\n${agents.join('\n')}`;
  }

  /**
   * Generate a response from a bot
   * @param {string} botId - Bot ID
   * @param {Array} conversationHistory - Conversation history
   * @param {string} providerType - Provider type
   * @param {Object} config - Bot config
   * @param {Object} options - Additional options (roomId for World Info, replyTo for reply context)
   */
  async generateResponse(botId, conversationHistory, providerType = 'llm', config = {}, options = {}) {
    try {
      console.log(`[BotRuntime] Generating response for ${botId} (provider: ${providerType})`);
      const adaptor = await this.getAdaptor(botId, providerType, config);

      // 1. Load Character Card
      const card = await this.cardLoader.load(botId);

      // 2. Get World Info (if roomId provided)
      let worldInfo = '';
      if (options.roomId) {
        const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
        const worldInfoContent = worldInfoManager.getInjectedContent(options.roomId, lastMessage);
        if (worldInfoContent) {
          worldInfo = `[World Info]\n${worldInfoContent}`;
        }
      }

      // 3. Get Agent Registry
      const registryPrompt = this.getAgentRegistry(botId);

      // 4. Build complete system prompt
      const systemPrompt = await this.buildSystemPrompt(botId, card, worldInfo, registryPrompt);

      // 5. Prepare messages
      let messages = [...conversationHistory];

      // Check if first message is already a system prompt
      if (messages.length > 0 && messages[0].role === 'system') {
        // Append our generated prompt to existing system message
        messages[0].content += `\n\n${systemPrompt}`;
      } else {
        // Prepend our system prompt
        messages.unshift({ role: 'system', content: systemPrompt });
      }

      // 6. Add Reply Context if provided
      if (options.replyTo) {
        // Insert a system message before the last user message to indicate this is a reply
        const replyContext = {
          role: 'system',
          content: `[Reply Context] You are replying to the message above. Respond directly to the sender in a conversational manner.`
        };
        // Insert before the last user message
        messages.splice(messages.length - 1, 0, replyContext);
      }

      // 7. Context Compression Logic
      const MAX_HISTORY_LENGTH = 10; // Keep last 10 messages
      if (messages.length > MAX_HISTORY_LENGTH + 1) { // +1 for system prompt
        const systemMsg = messages[0];
        const recentMessages = messages.slice(-(MAX_HISTORY_LENGTH));
        messages = [systemMsg, ...recentMessages];
        console.log(`[BotRuntime] Context compressed for ${botId}`);
      }

      // 8. Get the last message for the actual chat
      const lastMessage = messages[messages.length - 1].content;

      const startTime = Date.now();

      // 9. Call the adaptor with full history
      const responseContent = await adaptor.chat(lastMessage, { history: messages });
      const latency = Date.now() - startTime;

      console.log(`[BotRuntime] Response generated successfully for ${botId} (latency: ${latency}ms)`);

      return {
        success: true,
        content: responseContent,
        timestamp: new Date().toISOString(),
        metrics: { latency }
      };
    } catch (error) {
      console.error(`[BotRuntime] Error generating response for ${botId}:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const botRuntime = new BotRuntime();
