require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { fetchFromApi } = require('../utils/fetch-helper');
const pool = require('../utils/db');

const lastIdCache = {};

let notificationQueue = [];
let notificationTimer = null;
const notificationDelay = 1000;

const getLastId = async (dbTable, idColumn) => {
  if (lastIdCache[dbTable]) {
    console.log(
      `🗂️ Using cached lastId for ${dbTable}: ${lastIdCache[dbTable]}`
    );
    return lastIdCache[dbTable];
  }

  try {
    const result = await pool.query(
      `SELECT ${idColumn} FROM ${dbTable} WHERE id = 1`
    );

    const lastId = result.rows.length > 0 ? result.rows[0][idColumn] : 0;
    lastIdCache[dbTable] = lastId;
    console.log(`✅ Fetched lastId for ${dbTable}: ${lastId}`);

    return lastId;
  } catch (error) {
    console.error(`❌ Error getting lastId for ${dbTable}: ${error.message}`);
    return 0;
  }
};

const syncFromApi = async (
  client,
  idColumn,
  endpoint,
  dbTable,
  formatData,
  fetchType = 'first'
) => {
  const saveLastId = async (id) => {
    try {
      await pool.query(
        `INSERT INTO ${dbTable} (id, ${idColumn}, updated_at)
         VALUES (1, $1, NOW())
         ON CONFLICT (id) 
         DO UPDATE SET ${idColumn} = EXCLUDED.${idColumn}, updated_at = NOW()`,
        [id]
      );
      lastIdCache[dbTable] = id;
    } catch (error) {
      console.error(`Error saving ${idColumn}: ${error.message}`);
    }
  };

  const getAllPreviousItems = async () => {
    try {
      const result = await pool.query(
        `SELECT ${idColumn}, data FROM ${dbTable}`
      );

      const itemsMap = {};
      for (const row of result.rows) {
        itemsMap[row[idColumn]] = row.data;
      }

      return itemsMap;
    } catch (error) {
      console.error(`Error getting all previous items: ${error.message}`);
      return {};
    }
  };

  const queueNotification = (notificationData) => {
    if (!notificationData) return;

    notificationQueue.push(notificationData);

    if (!notificationTimer) {
      notificationTimer = setTimeout(() => {
        sendQueuedNotifications(client);
      }, notificationDelay);
    }
  };

  const sendQueuedNotifications = async () => {
    try {
      if (notificationQueue.length === 0) {
        notificationTimer = null;
        return;
      }

      console.log(
        `📣 Processing ${notificationQueue.length} queued notifications...`
      );

      if (notificationQueue.length === 1) {
        await sendNotification(notificationQueue[0]);
      } else {
        const groupedNotifications = {};

        for (const notification of notificationQueue) {
          if (!groupedNotifications[notification.title]) {
            groupedNotifications[notification.title] = {
              title: notification.title,
              description: [notification.description],
              color: notification.color,
            };
          } else {
            groupedNotifications[notification.title].description.push(
              notification.description
            );
          }
        }

        for (const key in groupedNotifications) {
          const group = groupedNotifications[key];

          await sendNotification({
            title: group.title,
            description: group.description.join('\n\n'),
            color: group.color,
          });
        }
      }

      notificationQueue = [];
      notificationTimer = null;
    } catch (error) {
      console.error(`Error sending queued notifications: ${error.message}`);
      notificationQueue = [];
      notificationTimer = null;
    }
  };

  const sendNotification = async (notificationData) => {
    try {
      if (!notificationData) return;

      const { title, description, url, messageId, color } = notificationData;

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

      if (!channel) {
        console.error('War updates channel not found');
        return;
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error sending notification: ${error.message}`);
    }
  };

  const saveAllData = async (data) => {
    try {
      if (!data || data.length === 0) return;
      console.log(`📊 Processing ${data.length} items from ${endpoint}...`);

      const previousItems = await getAllPreviousItems();

      const values = [];
      const params = [];
      let paramCounter = 1;
      let unchangedCount = 0;
      let changedCount = 0;

      for (const [index, item] of data.entries()) {
        const uniqueId = item.id ?? item.index ?? index;
        if (uniqueId === undefined) {
          console.warn(`Skipping item with invalid ID at index ${index}`);
          continue;
        }

        const previousItem = previousItems[uniqueId];

        let hasChanged = false;

        if (!previousItem) {
          hasChanged = true;
        } else if (item.currentOwner !== previousItem.currentOwner) {
          hasChanged = true;
        } else if (
          (item.event && !previousItem.event) ||
          (!item.event && previousItem.event) ||
          (item.event &&
            previousItem.event &&
            item.event.eventType !== previousItem.event.eventType)
        ) {
          hasChanged = true;
        }

        if (hasChanged) {
          values.push(`($${paramCounter}, NOW(), $${paramCounter + 1})`);
          params.push(uniqueId, JSON.stringify(item));
          paramCounter += 2;
          changedCount++;
        } else {
          unchangedCount++;
        }

        if (typeof formatData === 'function') {
          try {
            const notificationData = await formatData(item, previousItem);
            if (notificationData) {
              queueNotification(notificationData);
            }
          } catch (formatError) {
            console.error(
              `Error formatting notification: ${formatError.message}`
            );
          }
        }
      }

      if (values.length === 0) {
        console.log(`🤖 No changes detected among ${data.length} items`);
      } else {
        const query = `
          INSERT INTO ${dbTable} (${idColumn}, updated_at, data)
          VALUES ${values.join(', ')}
          ON CONFLICT (${idColumn})
          DO UPDATE SET updated_at = NOW(), data = EXCLUDED.data;
        `;

        await pool.query(query, params);
        console.log(
          `🤖 Updated ${changedCount} items, skipped ${unchangedCount} items`
        );
      }
    } catch (error) {
      console.error(`Error batch saving data: ${error.message}`);
    }
  };

  let lastId = null;

  try {
    if (fetchType !== 'all') {
      try {
        lastId = await getLastId(dbTable, idColumn);
      } catch (error) {
        console.error(`Error getting last id: ${error.message}`);
      }
    }

    const data = await fetchFromApi(endpoint);

    if (fetchType === 'all') {
      await saveAllData(data);
    } else {
      const selectedItem =
        fetchType === 'last' ? data[data.length - 1] : data[0];

      if (
        lastId === null ||
        (fetchType === 'first'
          ? lastId !== selectedItem.id
          : lastId < selectedItem.id)
      ) {
        await saveLastId(selectedItem.id);

        const notificationData = await formatData(selectedItem);
        queueNotification(notificationData);
      }
    }
  } catch (error) {
    console.error(`Error in syncFromApi (${endpoint}): ${error.message}`);
  }
};

module.exports = { syncFromApi };
