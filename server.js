require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const Movies = require('./data.json');
const TOKEN = process.env.API_TOKEN;

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(authorize);

/**
 * Validate API Bearer token.
 */
function authorize(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.split(' ')[1];
  if (token === TOKEN) return next();

  res.status(401).json({
    error: 'Please give a valid API Token.'
  });
}

/**
 * Filter by search parameters genre,
 * country or average vote.
 */
function handleGetMovies(req, res) {
  const { genre, country, avg_vote } = req.query;
  let body = Movies;

  if (genre) {
    body = body.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }

  if (country) {
    body = body.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }

  if (avg_vote) {
    body = body.filter(movie => movie.avg_vote >= Number(avg_vote));
  }

  res.json(body);
}

app.get('/movie', handleGetMovies);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});
