const { getRedisClient } = require('./redis');

async function cacheGet(key) {
  const client = await getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function cacheSet(key, value, expirationInSeconds = 3600) {
  const client = await getRedisClient();
  await client.set(key, JSON.stringify(value), {
    EX: expirationInSeconds,
  });
}

async function cacheDelete(key) {
  const client = await getRedisClient();
  await client.del(key);
}

async function cacheExists(key) {
  const client = await getRedisClient();
  return (await client.exists(key)) === 1;
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheExists,
};
