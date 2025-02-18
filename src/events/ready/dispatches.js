require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const pool = require('../../utils/db');

let lastDispatchId = null;

const loadLastDispatchId = async () => {
  try {
    const result = await pool.query(
      'SELECT dispatch_id FROM last_dispatches ORDER BY updated_at DESC LIMIT 1'
    );
    if (result.rows.length > 0) {
      lastDispatchId = result.rows[0].dispatch_id;
    }
  } catch (error) {
    console.error(`Error loading last dispatch id: ${error.message}`);
  }
};

const saveDispatchId = async (id) => {
  try {
    await pool.query('INSERT INTO last_dispatches (dispatch_id) VALUES ($1)', [
      id,
    ]);
  } catch (error) {
    console.error(`Error saving dispatch id: ${error.message}`);
  }
};

module.exports = async (client) => {
  try {
    if (lastDispatchId === null) {
      await loadLastDispatchId();
    }

    const response = await fetch(
      `${process.env.HELLDIVERS_API_URL}/dispatches`,
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

    const latestDispatch = data[0];

    if (lastDispatchId !== latestDispatch.id) {
      await saveDispatchId(latestDispatch.id);
      lastDispatchId = latestDispatch.id;

      const dispatchMatch = latestDispatch.message.match(/<i=3>([^<]+)<\/i>/);
      const dispatchTitle = dispatchMatch ? dispatchMatch[1] : 'New Dispatch';

      const cleanMessage = latestDispatch.message
        .replace(/<i=3>[^<]+<\/i>\n\n/, '')
        .replace(/<i=\d+>|<\/i>/g, '**');

      const embed = new EmbedBuilder()
        .setTitle(dispatchTitle)
        .setDescription(cleanMessage)
        .setColor('fee34c')
        .setFooter({ text: `Message #${latestDispatch.id}` });

      const channel = client.channels.cache.get(
        `${process.env.WAR_UPDATES_CHANNEL_ID}`
      );

      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.log(error);
  }
};
