const express = require('express');
const {Blog} = require('../../database/schemas');
const router = express.Router();

router.get('/api/blog/post-list', async (req, res) => {
    const page = req.query.page || 0;
    const pageSize = 12

    const result = await Blog.find({}, 'title slug image')
        .sort({published_at: -1})
        .skip(page * pageSize)
        .limit(pageSize)
        .exec()

    const postCount = await Blog.countDocuments();

    if (!result) {
        res.status(404).send('No blog found');
    }

    res.status(200).json({
        posts: result,
        postCount: postCount,
    });
});

module.exports = router;
