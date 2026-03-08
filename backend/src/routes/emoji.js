/**
 * Emoji and Media Routes for Fastify
 */
import { emojiService } from '../services/emojiService.js';

export function emojiRoutes(fastify, options, done) {
  // 获取所有表情
  fastify.get('/api/emoji', async (request, reply) => {
    try {
      const emojis = emojiService.getAllEmojis();
      const groups = emojiService.getEmojiGroups();
      const frequent = emojiService.getMostUsedEmojis(10);
      reply.send({
        success: true,
        emojis,
        groups,
        frequent
      });
    } catch (error) {
      console.error('Error fetching emojis:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // 获取上传的图片列表
  fastify.get('/api/emoji/images', async (request, reply) => {
    try {
      const images = emojiService.getUploadedImages();
      reply.send({ success: true, images });
    } catch (error) {
      console.error('Error fetching images:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // 上传 base64 图片
  fastify.post('/api/emoji/upload', async (request, reply) => {
    try {
      const { base64, filename } = request.body;
      if (!base64) {
        return reply.code(400).send({ success: false, error: 'Base64 data is required' });
      }
      const result = await emojiService.uploadImageFromBase64(base64, filename || 'upload.png');
      if (result.success) {
        reply.send(result);
      } else {
        reply.code(400).send(result);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // 删除图片
  fastify.delete('/api/emoji/images/:filename', async (request, reply) => {
    try {
      const { filename } = request.params;
      const result = emojiService.deleteImage(filename);
      if (result.success) {
        reply.send(result);
      } else {
        reply.code(404).send(result);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  done();
}
