/**
 * YAML + Markdown Character Card Loader
 *
 * Parses SillyTavern V2 format:
 * - YAML Frontmatter for metadata
 * - Markdown body for detailed descriptions
 *
 * Format:
 * ```
 * ---
 * spec: chara-card-v2
 * name: Character Name
 * personality: |
 *   Long description...
 * ---
 *
 * # Character Details
 * ...
 * ```
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { db } from '../../db.js';

export class YAMLLoader {
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
   * Parse YAML Frontmatter + Markdown content
   * @param {string} content - File content
   * @returns {Object} - { frontmatter: Object, body: string }
   */
  parseFrontmatter(content) {
    const match = content.match(/^---\s*[\r\n]([\s\S]*?)---\s*[\r\n]([\s\S]*)$/);

    if (!match) {
      // No frontmatter, return as-is with empty frontmatter
      return {
        frontmatter: {},
        body: content.trim()
      };
    }

    const [, frontmatterStr, body] = match;

    let frontmatter = {};
    try {
      frontmatter = yaml.load(frontmatterStr);
    } catch (e) {
      console.error('[YAMLLoader] Failed to parse YAML frontmatter:', e.message);
      throw new Error(`Invalid YAML frontmatter: ${e.message}`);
    }

    return {
      frontmatter: frontmatter || {},
      body: body.trim()
    };
  }

  /**
   * Convert character card to YAML+Markdown format
   * @param {CharacterCard} card - Character card object
   * @returns {string} - Formatted content
   */
  toYamlMarkdown(card) {
    const frontmatter = {
      spec: card.version || 'chara-card-v2',
      name: card.name,
      description: card.description,
      personality: card.personality,
      scenario: card.scenario,
      mes_example: card.mes_example,
      avatar: card.avatar,
      first_mes: card.first_mes,
      system_prompt: card.system_prompt,
      post_history_instructions: card.post_history_instructions,
      creator_notes: card.creator_notes,
      tags: card.tags || [],
      extensions: card.extensions || {}
    };

    // Remove undefined/null values
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined || frontmatter[key] === null || frontmatter[key] === '') {
        delete frontmatter[key];
      }
    });

    const yamlStr = yaml.dump(frontmatter, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });

    return `---\n${yamlStr}---\n`;
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
          // Return empty card with default structure
          resolve(this.createEmptyCard(botId));
          return;
        }

        try {
          let card;

          // Try to parse as JSON first (for backward compatibility)
          if (row.character_card.trim().startsWith('{')) {
            card = JSON.parse(row.character_card);
          } else {
            // Parse YAML+Markdown format
            const { frontmatter, body } = this.parseFrontmatter(row.character_card);
            card = {
              ...frontmatter,
              version: frontmatter.spec || frontmatter.version || 'chara-card-v2',
              details: body // Store markdown body as details
            };
          }

          resolve(card);
        } catch (e) {
          console.error('[YAMLLoader] Failed to parse character card:', e.message);
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
    // Convert to YAML+Markdown format for storage
    const content = this.toYamlMarkdown(card);

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
    const { frontmatter, body } = this.parseFrontmatter(content);

    return {
      ...frontmatter,
      version: frontmatter.spec || frontmatter.version || 'chara-card-v2',
      details: body
    };
  }

  /**
   * Export a character card to a file
   * @param {string} botId - The bot ID
   * @param {string} filePath - Export path
   * @returns {Promise<void>}
   */
  async export(botId, filePath) {
    const card = await this.load(botId);
    const content = this.toYamlMarkdown(card);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * List available templates
   * @returns {Promise<string[]>}
   */
  async listTemplates() {
    const files = fs.readdirSync(this.templatesDir);
    return files
      .filter(f => f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.yml'))
      .map(f => path.basename(f, path.extname(f)));
  }

  /**
   * Load a template by name
   * @param {string} templateName - Template name
   * @returns {Promise<CharacterCard>}
   */
  async loadTemplate(templateName) {
    const possibleExtensions = ['.md', '.yaml', '.yml'];

    for (const ext of possibleExtensions) {
      const filePath = path.join(this.templatesDir, `${templateName}${ext}`);
      if (fs.existsSync(filePath)) {
        return this.import(filePath);
      }
    }

    throw new Error(`Template "${templateName}" not found`);
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

export default YAMLLoader;
