const Redis = require('ioredis');
const Queue = require('bull');
const uniq = require('lodash/uniq');
const config = require('../config');
const { ParserService } = require('../services');

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS
});

const htmlParsingQueue = new Queue('html-parsing-queue', {
  redis: {
    host: config.REDIS_HOST,
    post: config.REDIS_PORT,
  }
});

htmlParsingQueue.process(async (job, done) => {
  console.log('HTML Parsing Queue started.');

  const data = await ParserService.parseHomePage();
  redis.hset('cinema', '/api/v1/data', JSON.stringify(data));

  const movieIds = [];

  await Promise.all(data.cinemas.map(async c => {
    try {
      if (!c.id) return;
      const cinema = await ParserService.parseCinemaPage(c.id);
      redis.hset('cinema', `/api/v1/cinema/${cinema.id}`, JSON.stringify(cinema));
      cinema.movies.forEach(movie => movieIds.push(movie.id));
      return cinema;
    } catch (e) {
      console.log(`Error parsing cinema ID ${c.id}`, e);
      return;
    }
  }));

  await Promise.all(uniq(movieIds).map(async id => {
    try {
      const movie = await ParserService.parseMoviePage(id);
      redis.hset('cinema', `/api/v1/movies/${movie.id}`, JSON.stringify(movie));
      return movie;
    } catch (e) {
      console.log(`Error parsing movie ID ${id}`, e);
      return;
    }
  }));

  done(null);
});

module.exports = htmlParsingQueue;
