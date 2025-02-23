require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const pool = require('./db');

const syncFromApi = async (client, idColumn, endpoint, dbTable, formatData) => {
  let lastId = null;

  const loadLastId = async () => {
    try {
      const result = await pool.query(
        `SELECT ${idColumn} FROM ${dbTable} ORDER BY updated_at DESC LIMIT 1`
      );

      if (result.rows.length > 0) {
        lastId = result.rows[0][`${idColumn}`];
      }
    } catch (error) {
      console.error(`Error loading last ${idColumn}: ${error.message}`);
    }
  };

  const saveLastId = async (id) => {
    try {
      await pool.query(`INSERT INTO ${dbTable} (${idColumn}) VALUES ($1)`, [
        id,
      ]);
    } catch (error) {
      console.error(`Error saving ${idColumn}: ${error.message}`);
    }
  };

  try {
    if (lastId === null) {
      await loadLastId();
    }

    const response = await fetch(
      `${process.env.HELLDIVERS_API_URL}/${endpoint}`,
      {
        method: 'GET',
        headers: {
          'X-Super-Client': `${process.env.SUPER_CLIENT}`,
          'X-Super-Contact': `${process.env.SUPER_CONTACT}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const latestItem = data[0];

    if (lastId !== latestItem.id) {
      await saveLastId(latestItem.id);
      lastId = latestItem.id;

      const { title, description, url, color } = formatData(latestItem);

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Message #${latestItem.id}` });

      if (url) {
        embed.setURL(url);
      }

      const channel = client.channels.cache.get(
        process.env.WAR_UPDATES_CHANNEL_ID
      );
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = { syncFromApi };
