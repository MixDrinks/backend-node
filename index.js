require('dotenv').config();

const express = require('express');
const cors = require('cors');
const postListRoutes = require('./features/post-list/post-list-rest');
const postDetailsRoutes = require('./features/post-list/post-details-rest');
const cocktailDetails = require('./features/cocktail/rest');
const service = require('./features/service');
const glasswareDetails = require('./features/glassware/rest');
const toolDetails = require('./features/tools/rest');
const goodDetails = require('./features/goods/rest');
const filter = require('./features/filters/rest');
const siteMap = require('./features/sitemap/rest');
const { checkIsUrlNeedRedirect } = require('./features/redirects/check');

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

app.use(express.json());

async function redirectIfXUserPath(req, res, next) {
  const xUserPath = req.headers['x-user-path'];

  if (xUserPath) {
    const redirect = await checkIsUrlNeedRedirect(xUserPath)

    if (redirect.isRedirect == true) {
      return res.status(200).json({ redirect: redirect.to });
    }
  }
  next();
}

// Use the middleware in your Express app
app.use(redirectIfXUserPath);

app.use(
  postListRoutes,
  postDetailsRoutes,
  cocktailDetails,
  glasswareDetails,
  toolDetails,
  goodDetails,
  filter,
  siteMap,
  service
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
