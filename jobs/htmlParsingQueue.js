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
  let progress = 0;
  const data = await ParserService.parseHomePage();
  redis.hset('cinema', '/api/v1/data', JSON.stringify(data));

  progress = 25;
  job.progress(progress);

  let movieIds = [];

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

  progress += 25;
  job.progress(progress);

  movieIds = uniq(movieIds);

  for(id of movieIds) {
    try {
      const movie = await ParserService.parseMoviePage(id);
      redis.hset('cinema', `/api/v1/movies/${movie.id}`, JSON.stringify(movie));
      progress += Math.floor(50 / movieIds.length);
      job.progress(progress);
    } catch (e) {
      console.log(`Error parsing movie ID ${id}`, e);
    }
  }

  done(null);
});

module.exports = htmlParsingQueue;
