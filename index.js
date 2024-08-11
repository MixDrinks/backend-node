require('dotenv').config();

const express = require('express');
const cors = require('cors');
const postListRoutes = require('./features/post-list/post-list-rest');
const postDetailsRoutes = require('./features/post-list/post-details-rest');
const cocktailDetails = require('./features/cocktail/rest');
const service = require('./features/service');

const app = express();
const port = process.env.APP_PORT;

app.use(cors({
  origin: '*', // Equivalent to anyHost()
  methods: '*', // Equivalent to allowing all methods
  allowedHeaders: '*', // Equivalent to allowHeaders { true }
  credentials: true, // Equivalent to allowCredentials = true
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.use(postListRoutes, postDetailsRoutes, cocktailDetails, service);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
