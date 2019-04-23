const axios = require('axios');
const { JSDOM } = require('jsdom');

async function parseHomePage() {
  const { data: page } = await axios.get('https://www.cinema.com.do/index.php?x=cines');
  const { document } = new JSDOM(page).window;

  const cinemas = [];
  const cities = [];

  // Get list of cinemas
  document
    .querySelectorAll('#cineloclist option')
    .forEach(cinemaNode => cinemas.push({
      id: cinemaNode.value,
      name: cinemaNode.textContent,
    }));

  // Get list of cities
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

  return { cinemas, cities };
}


async function parseCinemaPage(cinemaId) {
  const { data: page } = await axios.get(`https://www.cinema.com.do/cine.php?id=${cinemaId}`);
  const { document } = new JSDOM(page).window;

  const cinema = {
    name: '',
    address: '',
    phone: '',
    movies: [],
  };

  cinema.name = document.querySelector('h2').textContent;

  document.querySelectorAll('.meta.container p').forEach(p => {
    if (p.textContent.includes('UBICACION')) {
      cinema.address = p.textContent.replace('UBICACION: ', '');
    }

    if (p.textContent.includes('TELEFONO')) {
      cinema.phone = p.textContent.replace('TELEFONO: ', '');
    }
  });

  document
    .querySelectorAll('.moviesGrid .img-container a:first-child')
    .forEach(node => cinema.movies.push({
      id: node.href.split('id=')[1],
      posterUrl: `https://www.cinema.com.do/${node.childNodes[1].src}`,
      title: node.childNodes[3].textContent,
      room: node.childNodes[5].textContent,
      language: node.childNodes[7].textContent,
      date: node.childNodes[9].textContent,
      hour: node.childNodes[11].textContent,
    }));

  return cinema;
}

async function parseMoviePage(movieId) {
  const { data: page } = await axios.get(`https://www.cinema.com.do/detalles.php?id=${movieId}`);
  const { document } = new JSDOM(page).window;

  const movie = {
    id: movieId,
    title: '',
    posterUrl: '',
    summary: '',
    youtubeId: '',
    imdbScore: '',
    metacriticScore: '',
  }

  movie.title = document.querySelector('div.small-12.medium-8.large-8.columns h1').textContent;
  movie.posterUrl = `https://www.cinema.com.do/${document.querySelector('img.poster').src}`;
  movie.summary = document.querySelector('h3 + p').textContent;
  movie.youtubeId = document.querySelector('iframe').src.replace('https://www.youtube.com/embed/', '');

  const imdbTitle = document.querySelector('span.imdbRatingPlugin')

  if (imdbTitle) {
    const { data: imdbPage } = await axios.get(`https://www.imdb.com/title/${imdbTitle.dataset.title}`);
    const { document: imdbDocument } = new JSDOM(imdbPage).window;
    movie.imdbScore = imdbDocument.querySelector('div.ratingValue span[itemprop="ratingValue"]').textContent;
    movie.metacriticScore = imdbDocument.querySelector('div.metacriticScore span').textContent;
  }

  return movie;
}


module.exports = {
  parseHomePage,
  parseCinemaPage,
  parseMoviePage,
};
