const express = require('express');
const {Blog} = require('../../database/schemas');
const router = express.Router();

router.get('/api/blog/post-list', (req, res) => {
    const page = req.query.page || 1;
    const pageSize = 12

    Blog.find({}, 'title slug image')
        .sort({published_at: -1})
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec()
        .then(blogs => {
            res.status(200).json(blogs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

module.exports = router;
