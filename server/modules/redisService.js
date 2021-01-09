const redis = require('redis');

function loadDatabase(database) {
  const client = redis.createClient({
    port: process.env.REDISPORT || 6379,
    host: process.env.REDISHOST || 'localhost',
  });
  client.on('error', (err) => { throw new Error(err); });
  client.select(database, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
  return client;
}

module.exports = { loadDatabase };
