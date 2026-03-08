// 表情包服务 - 管理表情和图片

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

export class EmojiService {
  constructor() {
    this.emojis = [
      // 基础表情
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛',
      '😝', '🤑', '😎', '🤓', '🧐', '🤠', '🥳', '🤡',
      '🥺', '😢', '😭', '😳', '😶‍🌫️', '😨', '😰',
      '😥', '😓', '🫣', '🤗', '🤔', '🫤', '🤤', '😴', '🥱',
      '🤮', '🤢', '🤧', '😎', '🤠', '🤡', '🤡'
    ];
    
    this.emojiGroups = {
      smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃'],
      hearts: ['❤️', '💖', '💗', '💓', '💔', '💕', '💞', '💘', '💝', '💟'],
      gestures: ['👍', '👎', '👊', '✌️', '🙏', '👏', '💪', '✋'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
      food: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍕', '🍔', '🍟', '🍩', '🍔']
    };

    this.emojiDirectory = './data/emojis';
    this.emojiDatabase = {};
    
    this.init();
  }

  init() {
    // 初始化表情数据库
    try {
      if (!existsSync(this.emojiDirectory)) {
        mkdirSync(this.emojiDirectory, { recursive: true });
      }
      
      // 加载已保存的表情
      if (existsSync(join(this.emojiDirectory, 'database.json'))) {
        const data = readFileSync(join(this.emojiDirectory, 'database.json'), 'utf8');
        this.emojiDatabase = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error initializing emoji service:', error);
    }
  }

  // 获取所有表情
  getAllEmojis() {
    return this.emojis;
  }

  // 获取表情分组
  getEmojiGroups() {
    return this.emojiGroups;
  }

  // 获取随机表情
  getRandomEmoji() {
    return this.emojis[Math.floor(Math.random() * this.emojis.length)];
  }

  // 上传图片（保存到本地）
  async uploadImage(fileBuffer, filename) {
    const timestamp = Date.now();
    const extension = filename.split('.').pop().toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    if (!allowedExtensions.includes(extension)) {
      return { success: false, error: '不支持的文件类型' };
    }

    const safeFilename = `${timestamp}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = join(this.emojiDirectory, safeFilename);

    try {
      writeFileSync(filePath, fileBuffer);
      
      const imageUrl = `/uploads/${safeFilename}`;
      
      return { 
        success: true, 
        imageUrl,
        filename: safeFilename,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: '上传失败' };
    }
  }

  // 获取上传的图片列表
  getUploadedImages() {
    try {
      const files = readdirSync(this.emojiDirectory);
      return files
        .filter(file => 
          ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.split('.').pop().toLowerCase())
        )
        .map(file => ({
          filename: file,
          url: `/uploads/${file}`,
          size: statSync(join(this.emojiDirectory, file)).size,
          createdAt: statSync(join(this.emojiDirectory, file)).birthtime
        }));
    } catch (error) {
      console.error('Error getting uploaded images:', error);
      return [];
    }
  }

  // 删除图片
  deleteImage(filename) {
    try {
      const filePath = join(this.emojiDirectory, filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, error: '文件不存在' };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: '删除失败' };
    }
  }

  // 保存表情到数据库
  saveEmojiUsage(emoji, usageCount = 1) {
    this.emojiDatabase[emoji] = (this.emojiDatabase[emoji] || 0) + usageCount;
    
    try {
      writeFileSync(
        join(this.emojiDirectory, 'database.json'),
        JSON.stringify(this.emojiDatabase, null, 2)
      );
    } catch (error) {
      console.error('Error saving emoji usage:', error);
    }
  }

  // 按使用频率排序表情
  getMostUsedEmojis(limit = 10) {
    return Object.entries(this.emojiDatabase)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([emoji, count]) => ({ emoji, count }));
  }

  // 从 base64 上传图片
  async uploadImageFromBase64(base64Data, filename) {
    try {
      const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
      return await this.uploadImage(buffer, filename);
    } catch (error) {
      console.error('Error uploading image from base64:', error);
      return { success: false, error: 'Base64 解码失败' };
    }
  }
}

export const emojiService = new EmojiService();
