const { getKeywordsByCategory } = require('../database/keywords');

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
      this.keywords = await getKeywordsByCategory();
      this.patterns = await this.updateDetectionPatterns();
      console.log('Democracy keywords loaded successfully 🚀');
    } catch (error) {
      console.error(`Error loading democracy enforcement keywords: ${error}`);
    }
  }

  async updateDetectionPatterns() {
    return [
      this.createPatternFromCategories('subjects', 'negative_adjectives'),
      this.createPatternFromCategories('subjects', 'negative_actions'),
      this.createPatternFromCategories('enemies', 'suspicious_positive'),
    ];
  }

  createPatternFromCategories(category1, category2) {
    const cat1 = this.keywords[category1]?.join('|') || '';
    const cat2 = this.keywords[category2]?.join('|') || '';
    return new RegExp(`(?=.*(${cat1}))(?=.*(${cat2}))`, 'i');
  }

  testMessage(content) {
    return this.patterns.some((pattern) => pattern.test(content));
  }
}

module.exports = KeywordCache;
