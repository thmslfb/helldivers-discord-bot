require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const pool = require('../../utils/db');

class KeywordCache {
  constructor() {
    this.keywords = {};
    this.patterns = [];
    this.initialize();
  }

  async initialize() {
    await this.loadCache();
  }

  async loadCache() {
    try {
      console.log('Loading democracy enforcement keywords...');
      this.keywords = await this.getKeywordsByCategory();
      this.patterns = await this.updateDetectionPatterns();
      console.log('Democracy keywords loaded successfully 🚀');
    } catch (error) {
      console.error(`Error loading democracy enforcement keywords: ${error}`);
    }
  }

  async getKeywordsByCategory() {
    try {
      const { rows } = await pool.query(`
        SELECT c.name as category, array_agg(k.word) as words
        FROM categories c
        JOIN keywords k ON k.category_id = c.id
        GROUP BY c.name
      `);

      const keywords = {};
      rows.forEach((row) => {
        keywords[row.category] = row.words;
      });

      return keywords;
    } catch (error) {
      console.error(`Error fetching keywords: ${error}`);
      return {};
    }
  }

  async updateDetectionPatterns() {
    return [
      this.createPatternFromCategories('subject', 'negative_adjectives'),
      this.createPatternFromCategories('subject', 'negative_actions'),
      this.createPatternFromCategories('enemies', 'suspicious_positive'),
    ];
  }

  createPatternFromCategories(subjectCategory, attributeCategory) {
    const subjectWords = this.keywords[subjectCategory]?.join('|') || '';
    const attributeWords = this.keywords[attributeCategory]?.join('|') || '';
    return new RegExp(`(?=.*(${subjectWords}))(?=.*(${attributeWords}))`, 'i');
  }

  testMessage(content) {
    return this.patterns.some((pattern) => pattern.test(content));
  }
}

const cache = new KeywordCache();

module.exports = async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();

  if (cache.testMessage(messageContent)) {
    try {
      await message.delete();

      const embed = new EmbedBuilder()
        .setTitle('INFRACTION DETECTED!')
        .setDescription(
          'Your nearest Democracy Enforcement Officer has been notified of this infraction and will be with you shortly.'
        )
        .setColor('ff4545')
        .setFooter({ text: `Reported user: ${message.author.tag}` });

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error handling democracy infraction: ${error}`);
    }
  }
};
