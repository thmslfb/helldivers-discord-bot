require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const pool = require('../../utils/db');
const { cacheGet, cacheSet } = require('../../utils/cache-helper');

class KeywordCache {
  constructor() {
    this.keywords = {};
    this.patterns = [];
    this.lastCacheTime = 0;
    this.initialize();
  }

  async initialize() {
    await this.loadCache();
  }

  async loadCache() {
    try {
      const cachedKeywords = await cacheGet('democracy:keywords');
      const cachedPatterns = await cacheGet('democracy:patterns');

      if (cachedKeywords && cachedPatterns) {
        this.keywords = cachedKeywords;
        this.patterns = cachedPatterns;
        this.lastCacheTime = Date.now();
        console.log('⚡ Democracy keywords loaded from cache');
        return;
      }

      this.keywords = await this.getKeywordsByCategory();
      this.patterns = await this.updateDetectionPatterns();

      await cacheSet('democracy:keywords', this.keywords);
      await cacheSet('democracy:patterns', this.patterns);

      this.lastCacheTime = Date.now();
      console.log('💾 Democracy keywords loaded from database and cached');
    } catch (error) {
      console.error(
        `❌ Error loading democracy enforcement keywords: ${error}`
      );
    }
  }

  async refreshCacheIfNeeded(maxAgeMs = 5 * 60 * 1000) {
    if (Date.now() - this.lastCacheTime > maxAgeMs) {
      await this.loadCache();
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
      console.error(`❌ Error fetching keywords: ${error}`);
      return {};
    }
  }

  async updateDetectionPatterns() {
    return [
      this.createPatternFromCategories('subject', 'negative_adjectives', 5),
      this.createPatternFromCategories('subject', 'negative_actions', 5),
      this.createPatternFromCategories('enemies', 'suspicious_positive', 5),
    ];
  }

  createPatternFromCategories(subjectCategory, attributeCategory, maxDistance) {
    const subjectWords = this.keywords[subjectCategory] || [];
    const attributeWords = this.keywords[attributeCategory] || [];

    return {
      test: (content) => {
        const wordArray = content.toLowerCase().split(/\s+/);

        const subjectPositions = [];
        const attributePositions = [];

        wordArray.forEach((word, index) => {
          if (subjectWords.some((keyword) => word.includes(keyword))) {
            subjectPositions.push(index);
          }
          if (attributeWords.some((keyword) => word.includes(keyword))) {
            attributePositions.push(index);
          }
        });

        for (const subjectPos of subjectPositions) {
          for (const attributePos of attributePositions) {
            if (Math.abs(subjectPos - attributePos) <= maxDistance) {
              return true;
            }
          }
        }
        return false;
      },
    };
  }

  async testMessage(content) {
    await this.refreshCacheIfNeeded();
    return this.patterns.some((pattern) => pattern.test(content));
  }
}

const cache = new KeywordCache();

module.exports = async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();

  if (await cache.testMessage(messageContent)) {
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
      console.error(`❌ Error handling democracy infraction: ${error}`);
    }
  }
};
