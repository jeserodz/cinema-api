const Arena = require('bull-arena');
const config = require('../config');
const { htmlParsingQueue } = require('.');

const queues = [htmlParsingQueue];

const ui = Arena({
  queues: queues.map(q => ({
    name: q.name,
    hostId: 'queues',
    redis: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    }
  }))
}, {
  disableListen: true,
});

module.exports = ui;
