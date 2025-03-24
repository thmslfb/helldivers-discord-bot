const { createClient } = require('redis');
require('dotenv').config();

let client = null;

async function getRedisClient() {
  if (client === null) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => console.error(`Redis error: ${err}`));
    client.on('connect', () => console.log('Redis connected'));

    await client.connect();
  }

  return client;
}

module.exports = { getRedisClient };
