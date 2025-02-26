require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const pool = require('../utils/db');

const syncFromApi = async (
  client,
  idColumn,
  endpoint,
  dbTable,
  formatData,
  fetchType = 'first'
) => {
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
      await pool.query(
        `INSERT INTO ${dbTable} (id, ${idColumn}, updated_at)
         VALUES (1, $1, NOW())
         ON CONFLICT (id) 
         DO UPDATE SET ${idColumn} = EXCLUDED.${idColumn}, updated_at = NOW()`,
        [id]
      );
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
    const selectedItem = fetchType === 'last' ? data[data.length - 1] : data[0];

    if (
      fetchType === 'first'
        ? lastId !== selectedItem.id
        : lastId < selectedItem.id
    ) {
      await saveLastId(selectedItem.id);
      lastId = selectedItem.id;

      const { title, description, url, messageId, color } =
        formatData(selectedItem);

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

      if (url) {
        embed.setURL(url);
      }

      if (messageId) {
        embed.setFooter({ text: `Message #${messageId}` });
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
