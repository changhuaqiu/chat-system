import { db } from '../db.js';

export class MessageService {
  constructor(database) {
    this.db = database;
  }

  // Save message to database
  async saveMessage(roomId, sender, content, mentions = [], messageType = 'text', mediaUrl = null, replyToId = null, metadata = {}) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    try {
      const stmt = this.db.prepare(
        'INSERT INTO messages (id, room_id, sender, content, mentions, message_type, media_url, timestamp, reply_to_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(id, roomId, sender, content, JSON.stringify(mentions), messageType, mediaUrl, timestamp, replyToId, JSON.stringify(metadata));

      return {
        id,
        roomId,
        sender,
        content,
        mentions,
        messageType,
        mediaUrl,
        timestamp,
        replyToId,
        metadata
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Get messages for a room
  async getRoomMessages(roomId, limit = 50, offset = 0) {
    try {
      const stmt = this.db.prepare(
        'SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?'
      );
      const messages = stmt.all(roomId, limit, offset);

      return messages.map(msg => ({
        ...msg,
        mentions: JSON.parse(msg.mentions || '[]')
      })).reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Get message by ID
  async getMessageById(messageId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
      const message = stmt.get(messageId);

      if (message) {
        return {
          ...message,
          mentions: JSON.parse(message.mentions || '[]')
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  // Get mentions for a user
  async getUserMentions(userId, limit = 20) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM messages 
        WHERE mentions LIKE ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      const messages = stmt.all(`%${userId}%`, limit);

      return messages.map(msg => ({
        ...msg,
        mentions: JSON.parse(msg.mentions || '[]')
      }));
    } catch (error) {
      console.error('Error fetching mentions:', error);
      throw error;
    }
  }

  // Delete old messages
  async pruneMessages(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
      const stmt = this.db.prepare('DELETE FROM messages WHERE timestamp < ?');
      stmt.run(cutoffDate);

      return { deleted: true, cutoffDate };
    } catch (error) {
      console.error('Error pruning messages:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService(db);
