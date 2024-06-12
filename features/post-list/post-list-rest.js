const express = require('express');
const {Blog} = require('../../database/schemas');
const router = express.Router();

router.get('/api/blog/post-list', async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = 12

    const result = await Blog.find({}, 'title slug image')
        .sort({published_at: -1})
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec()

    const pageCount = Math.ceil(await Blog.countDocuments() / pageSize);

    if (!result) {
        res.status(404).send('No blog found');
    }

    res.status(200).json({
        posts: result,
        pageCount: pageCount
    });
});

module.exports = router;
