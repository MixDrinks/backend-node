require('dotenv').config();
const express = require('express')
const {Blog} = require('../../database/schemas');
const {getFullCocktailBySlug} = require("../cocktail/utils");
const router = express.Router();

router.get('/api/blog/post-details/:slug', async (req, res) => {
  const slug = req.params.slug;

  Blog.findOne({slug: slug}, async (err, blog) => {
    if (err) {
      console.log(err)
      res.status(500).send(err);
    } else if (!blog) {
      res.status(404).send('Blog post not found');
    } else {
      const response = blog.toObject();

      for (let i = 0; i < response.body.length; i++) {
        // If the type is 'cocktail_id', make a request to your backend to get the cocktail details
        if (response.body[i].type === 'cocktail') {
          const cocktailSlug = response.body[i].values.slug;
          try {
            response.body[i].values = await getFullCocktailBySlug(cocktailSlug)
          } catch (error) {
            console.error(`Failed to get cocktail details for slug ${cocktailSlug}: ${error}`);
          }
        }
      }

      response.responseTime = new Date(); // Add the responseTime field
      res.status(200).json(response);
    }
  });
});

module.exports = router;