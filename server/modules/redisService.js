module.exports = require('redis').createClient({
  port: process.env.REDISPORT,
  host: process.env.REDISHOST,
});
