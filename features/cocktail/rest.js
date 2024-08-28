require('dotenv').config();
const express = require('express')
const { getFullCocktailBySlug } = require("./utils");
const { addVisitToCocktail, addRatingToCocktail  } = require("../../database/cocktailv2");

const router = express.Router();

router.get('/api/cocktail/:slug', async (req, res) => {
  const slug = req.params.slug;

  const cocktail = await getFullCocktailBySlug(slug);

  if (!cocktail) {
    return res.status(404).send('Cocktail not found');
  } else {
    return res.status(200).send(cocktail);
  }
});

router.post('/api/cocktail/:slug/visit', async (req, res) => {
  const slug = req.params.slug;

  const scoreInfo = await addVisitToCocktail(slug);

  if (!scoreInfo) {
    return res.status(404).send('Cocktail not found');
  } else {
    return res.status(200).send({ 'slug': slug });
  }
});

router.post('/api/cocktail/:slug/score', async (req, res) => {
  const slug = req.params.slug;
  const ratingValue = req.body.value;

  const ratingInfo = await addRatingToCocktail(slug, ratingValue);

  if (!ratingInfo) {
    return res.status(404).send('Cocktail not found');
  } else {
    return res.status(200).send({ 'slug': slug });
  }
});

module.exports = router;
