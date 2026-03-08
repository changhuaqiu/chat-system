/**
 * Character Card Loader Interface
 *
 * Loads and manages SillyTavern-style character cards.
 * Supports multiple formats: JSON, YAML+Markdown
 *
 * @interface CharacterCardLoader
 */

export class CharacterCardLoader {
  constructor() {
    if (this.constructor === CharacterCardLoader) {
      throw new Error('CharacterCardLoader is an interface, please use a concrete implementation');
    }
  }

  /**
   * Load a character card by bot ID
   * @param {string} botId - The bot ID
   * @returns {Promise<CharacterCard>} - The character card
   */
  async load(botId) {
    throw new Error('Method "load" must be implemented');
  }

  /**
   * Save a character card for a bot
   * @param {string} botId - The bot ID
   * @param {CharacterCard} card - The character card to save
   * @returns {Promise<void>}
   */
  async save(botId, card) {
    throw new Error('Method "save" must be implemented');
  }

  /**
   * Import a character card from a file
   * @param {string} filePath - Path to the card file
   * @returns {Promise<CharacterCard>} - The parsed character card
   */
  async import(filePath) {
    throw new Error('Method "import" must be implemented');
  }

  /**
   * Export a character card to a file
   * @param {string} botId - The bot ID
   * @param {string} filePath - Path to export to
   * @returns {Promise<void>}
   */
  async export(botId, filePath) {
    throw new Error('Method "export" must be implemented');
  }

  /**
   * List available character card templates
   * @returns {Promise<string[]>} - List of template names
   */
  async listTemplates() {
    throw new Error('Method "listTemplates" must be implemented');
  }

  /**
   * Load a template by name
   * @param {string} templateName - The template name
   * @returns {Promise<CharacterCard>} - The template card
   */
  async loadTemplate(templateName) {
    throw new Error('Method "loadTemplate" must be implemented');
  }
}

export default CharacterCardLoader;
