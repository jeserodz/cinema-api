const express = require('express');
const ParserService = require('./services/ParserService');

const app = express();

app.get('/api/v1/data', async (req, res) => {
  try {
    const data = await ParserService.parseHomePage();
    return res.json(data);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

app.get('/api/v1/cinema/:id', async (req, res) => {
  try {
    const cinema = await ParserService.parseCinemaPage(req.params.id);
    return res.json(cinema);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

app.get('/api/v1/movies/:id', async (req, res) => {
  try {
    const movie = await ParserService.parseMoviePage(req.params.id);
    return res.json(movie);
  } catch (error) {
    return res.status(500).send(error.toString());
  }
});

module.exports = app;
