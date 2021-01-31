const redis = require('redis');
const { promisify } = require('util');

class Redis {
  static client = redis.createClient({
    port: process.env.REDISPORT,
    host: process.env.REDISHOST,
  });;

  static get = promisify(this.client.get).bind(this.client);

  static set = promisify(this.client.set).bind(this.client);

  static setnx = promisify(this.client.setnx).bind(this.client);

  static del = promisify(this.client.del).bind(this.client);
}
module.exports = Redis;
