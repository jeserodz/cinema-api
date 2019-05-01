const express = require('express');
const path = require('path');
const { cache } = require('./middlewares');
const { ParserService } = require('./services');
const jobs = require('./jobs');

jobs.htmlParsingQueue.add({}, {
  repeat: { cron: '*/5 * * * *' }
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/jobs', jobs.ui);

app.use('/api/v1/', cache);

app.get('/api/v1/data', async (req, res) => {
  try {
    if (req.cache) return res.json(req.cache);
    const data = await ParserService.parseHomePage();
    res.cache(data);
    return res.json(data);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

app.get('/api/v1/cinema/:id', async (req, res) => {
  try {
    if (req.cache) return res.json(req.cache);
    const cinema = await ParserService.parseCinemaPage(req.params.id);
    res.cache(cinema);
    return res.json(cinema);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

app.get('/api/v1/movies/:id', async (req, res) => {
  try {
    if (req.cache) return res.json(req.cache);
    const movie = await ParserService.parseMoviePage(req.params.id);
    res.cache(movie);
    return res.json(movie);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

app.get('/privacy', async (req, res) => {
  return res.render('privacy-policy');
});

app.get('/', async (req, res) => {
  return res.redirect('/api/v1/data');
});

module.exports = app;
