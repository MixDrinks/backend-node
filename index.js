require('dotenv').config();
const express = require('express');
const postListRoutes = require('./features/post-list/post-list-rest');
const postDetailsRoutes = require('./features/post-list/post-details-rest');
const cocktailDetails = require('./features/cocktail/details');

const app = express();
const port = process.env.APP_PORT;

app.use(express.json());

app.use(postListRoutes, postDetailsRoutes, cocktailDetails);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
