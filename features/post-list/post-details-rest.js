require('dotenv').config();
const express = require('express')
const axios = require('axios');
const {Blog} = require('../../database/schemas');
const router = express.Router();

const oldApiHost = process.env.OLD_API_HOST;

router.get('/api/blog/post-details/:slug', async (req, res) => {
  const slug = req.params.slug;

  console.log(`Fetching blog post details for slug ${slug}`);

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
            const cocktailDetails = await axios.get(`${oldApiHost}/v2/cocktail/${cocktailSlug}`);
            // Include the cocktail details in the response
            response.body[i].values = cocktailDetails.data;
          } catch (error) {
            console.error(`Failed to get cocktail details for slug ${cocktailId}: ${error}`);
          }
        }
      }

      response.responseTime = new Date(); // Add the responseTime field
      res.status(200).json(response);
    }
  });
});

module.exports = router;