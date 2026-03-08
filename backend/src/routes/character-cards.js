/**
 * Character Cards API Routes
 *
 * CRUD operations for SillyTavern-style character cards.
 */

import { db } from '../db.js';
import { YAMLLoader } from '../services/loaders/YAMLLoader.js';

const cardLoader = new YAMLLoader();

export async function characterCardsRoutes(fastify, options) {
  // GET /api/character-cards/:botId - Get character card for a bot
  fastify.get('/api/character-cards/:botId', async (request, reply) => {
    const { botId } = request.params;
    try {
      const card = await cardLoader.load(botId);
      reply.send({ success: true, card });
    } catch (error) {
      console.error('Error fetching character card:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/character-cards/:botId - Save character card for a bot
  fastify.post('/api/character-cards/:botId', async (request, reply) => {
    const { botId } = request.params;
    const card = request.body;

    try {
      // Validate required fields
      if (!card.name) {
        return reply.code(400).send({
          success: false,
          error: 'Character card must have a name'
        });
      }

      await cardLoader.save(botId, card);
      reply.send({ success: true, card });
    } catch (error) {
      console.error('Error saving character card:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/character-cards/import - Import character card from file
  fastify.post('/api/character-cards/import', async (request, reply) => {
    try {
      const { filePath } = request.body;
      if (!filePath) {
        return reply.code(400).send({
          success: false,
          error: 'File path is required'
        });
      }

      const card = await cardLoader.import(filePath);
      reply.send({ success: true, card });
    } catch (error) {
      console.error('Error importing character card:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // POST /api/character-cards/:botId/export - Export character card to file
  fastify.post('/api/character-cards/:botId/export', async (request, reply) => {
    const { botId } = request.params;
    const { filePath } = request.body;

    try {
      if (!filePath) {
        return reply.code(400).send({
          success: false,
          error: 'File path is required'
        });
      }

      await cardLoader.export(botId, filePath);
      reply.send({ success: true, message: `Exported character card to ${filePath}` });
    } catch (error) {
      console.error('Error exporting character card:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/character-cards/templates/list - List available templates
  fastify.get('/api/character-cards/templates/list', async (request, reply) => {
    try {
      const templates = await cardLoader.listTemplates();
      reply.send({ success: true, templates });
    } catch (error) {
      console.error('Error listing templates:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /api/character-cards/templates/:name - Load a template
  fastify.get('/api/character-cards/templates/:name', async (request, reply) => {
    const { name } = request.params;
    try {
      const card = await cardLoader.loadTemplate(name);
      reply.send({ success: true, card });
    } catch (error) {
      console.error('Error loading template:', error);
      reply.code(404).send({ success: false, error: error.message });
    }
  });

  // GET /api/character-cards/:botId/preview - Get formatted preview of character card
  fastify.get('/api/character-cards/:botId/preview', async (request, reply) => {
    const { botId } = request.params;
    try {
      const card = await cardLoader.load(botId);

      // Build a formatted preview
      const preview = {
        name: card.name || 'Unnamed Character',
        description: card.description || 'No description',
        personality: card.personality?.substring(0, 200) + (card.personality?.length > 200 ? '...' : '') || 'No personality set',
        scenario: card.scenario?.substring(0, 200) + (card.scenario?.length > 200 ? '...' : '') || 'No scenario set',
        exampleDialogues: card.mes_example
          ? card.mes_example.split('<START>').filter(s => s.trim()).slice(0, 2)
          : [],
        speakingStyle: card.extensions?.speakingStyle || null,
        tags: card.tags || []
      };

      reply.send({ success: true, preview });
    } catch (error) {
      console.error('Error generating preview:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}

export default characterCardsRoutes;
