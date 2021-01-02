const redis = require('redis');

function loadDatabase(database) {
  const client = redis.createClient({
    port: 6379,
    host: 'localhost',
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
