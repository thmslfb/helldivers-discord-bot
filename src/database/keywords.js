require('dotenv').config();
const pool = require('./db');

async function getKeywordsByCategory() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
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
  } finally {
    client.release();
  }
}

module.exports = {
  getKeywordsByCategory,
};
