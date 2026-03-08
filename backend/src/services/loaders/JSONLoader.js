/**
 * JSON Character Card Loader
 *
 * Parses simple JSON format character cards.
 * Used for backward compatibility and simple configurations.
 *
 * Format:
 * {
 *   "name": "Character Name",
 *   "description": "Short description",
 *   "personality": "Personality description",
 *   ...
 * }
 */

import fs from 'fs';
import path from 'path';
import { db } from '../../db.js';

export class JSONLoader {
  constructor(config = {}) {
    this.cardsDir = config.cardsDir || path.join(process.cwd(), 'bots', 'config');
    this.templatesDir = config.templatesDir || path.join(this.cardsDir, 'templates');

    // Ensure directories exist
    if (!fs.existsSync(this.cardsDir)) {
      fs.mkdirSync(this.cardsDir, { recursive: true });
    }
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  /**
   * Load a character card by bot ID from database
   * @param {string} botId - The bot ID
   * @returns {Promise<CharacterCard>}
   */
  async load(botId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT character_card FROM bots WHERE id = ?', [botId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row || !row.character_card) {
          resolve(this.createEmptyCard(botId));
          return;
        }

        try {
          let card;

          // Try to parse as JSON
          card = JSON.parse(row.character_card);
          resolve(card);
        } catch (e) {
          // If JSON parsing fails, return empty card
          console.error('[JSONLoader] Failed to parse character card as JSON:', e.message);
          resolve(this.createEmptyCard(botId));
        }
      });
    });
  }

  /**
   * Save a character card to database
   * @param {string} botId - The bot ID
   * @param {CharacterCard} card - Character card to save
   * @returns {Promise<void>}
   */
  async save(botId, card) {
    const content = JSON.stringify(card, null, 2);

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE bots SET character_card = ? WHERE id = ?',
        [content, botId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Import a character card from a file
   * @param {string} filePath - Path to the card file
   * @returns {Promise<CharacterCard>}
   */
  async import(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Export a character card to a file
   * @param {string} botId - The bot ID
   * @param {string} filePath - Export path
   * @returns {Promise<void>}
   */
  async export(botId, filePath) {
    const card = await this.load(botId);
    const content = JSON.stringify(card, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * List available templates
   * @returns {Promise<string[]>}
   */
  async listTemplates() {
    const files = fs.readdirSync(this.templatesDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => path.basename(f, '.json'));
  }

  /**
   * Load a template by name
   * @param {string} templateName - Template name
   * @returns {Promise<CharacterCard>}
   */
  async loadTemplate(templateName) {
    const filePath = path.join(this.templatesDir, `${templateName}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template "${templateName}" not found`);
    }
    return this.import(filePath);
  }

  /**
   * Create an empty character card with default structure
   * @param {string} botId - Bot ID
   * @returns {CharacterCard}
   */
  createEmptyCard(botId) {
    return {
      name: '',
      description: '',
      personality: '',
      scenario: '',
      mes_example: '',
      avatar: '',
      first_mes: '',
      system_prompt: '',
      post_history_instructions: '',
      creator_notes: '',
      tags: [],
      version: 'chara-card-v2',
      extensions: {
        speakingStyle: {
          tone: 'neutral',
          emojiUsage: 'none',
          sentenceLength: 'medium'
        },
        restrictions: [],
        catchphrases: []
      }
    };
  }
}

export default JSONLoader;
