const express = require("express");
const axios = require('axios');
const {Blog} = require('../../database/schemas');
const router = express.Router();

router.get('/api/blog/post-details/:slug', (req, res) => {
    console.log("GET /api/blog/post-details/:slug")
    const slug = req.params.slug;
    Blog.findOne({slug: slug}, async (err, blog) => {
        if (err) {
            res.status(500).send(err);
        } else if (!blog) {
            res.status(404).send('Blog post not found');
        } else {
            const response = blog.toObject(); // Convert the blog document to a plain JavaScript object

            // Iterate over the body array
            for (let i = 0; i < response.body.length; i++) {
                // If the type is 'cocktail_id', make a request to your backend to get the cocktail details
                if (response.body[i].type === 'cocktail_id') {
                    const cocktailId = response.body[i].values.id;
                    try {
                        const cocktailDetails = await axios.get(`https://api.mixdrinks.org/v2/cocktail/velykyi-getsbi`);
                        // Include the cocktail details in the response
                        response.body[i].values = cocktailDetails.data;
                    } catch (error) {
                        console.error(`Failed to get cocktail details for id ${cocktailId}: ${error}`);
                    }
                }
            }

            response.responseTime = new Date(); // Add the responseTime field
            res.status(200).json(response);
        }
    });
});

module.exports = router;