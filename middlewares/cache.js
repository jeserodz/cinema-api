const config = require('../config');
const Redis = require('ioredis');

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS
});

/**
 * Adds cached data to the request object for a specified req.path
 * and a res.cache function.
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 */
async function cache(req, res, next) {
  req.cache = JSON.parse(await redis.hget('cinema', req.originalUrl));

  res.cache = function (data) {
    redis.hset('cinema', req.originalUrl, JSON.stringify(data));
  }

  next();
}

module.exports = cache;
