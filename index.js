const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();

app.get('/api/data', async (req, res) => {
  const { data: page } = await axios.get('https://www.cinema.com.do/index.php?x=cines');
  const { document } = new JSDOM(page).window;

  // Get list of cinemas
  const cinemas = [];
  document
    .querySelectorAll('#cineloclist option')
    .forEach(cinemaNode => cinemas.push({
      id: cinemaNode.value,
      name: cinemaNode.textContent,
    }));

  // Get list of cities
  const cities = [];
  document
    .querySelectorAll('.collapsable-anchor')
    .forEach(node => cities.push({
      id: node.id,
      name: node.text,
    }));

  // Find relation between cities and cinemas
  cities.forEach(city => {
    const theaters = [];

    document
      .querySelectorAll(`.collapsable-anchor[id='${city.id}'] + ul .cinema-item`)
      .forEach(node => theaters.push(node.textContent));

    city.cinemas = theaters.map(t => {
      return cinemas.find(cinema => cinema.name === t);
    });
  });

  return res.json({
    cinemas,
    cities,
  });
});

app.get('/api/cinema/:id', async (req, res) => {
  const { data: page } = await axios.get(`https://www.cinema.com.do/cine.php?id=${req.params.id}`);
  const { document } = new JSDOM(page).window;

  return res.send('WIP!');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
