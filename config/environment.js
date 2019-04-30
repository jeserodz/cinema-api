const {
  PORT,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;

module.exports = {
  PORT: PORT || 3000,
  REDIS_HOST: REDIS_HOST || '127.0.0.1',
  REDIS_PORT: REDIS_PORT || 6379
};
