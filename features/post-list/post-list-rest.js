const express = require('express');
const {Blog} = require('../../database/schemas');
const router = express.Router();

router.get('/api/blog/post-list', (req, res) => {
    Blog.find({}, 'title slug image', (err, blogs) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).json(blogs);
        }
    });
});

module.exports = router;