const mongoose = require('./db');

const bodySchema = new mongoose.Schema({
    type: String,
    values: mongoose.Schema.Types.Mixed
}, {_id: false});

const blogSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    body: [bodySchema],
    image: String,
    slug: String,
    published_at: Boolean,
}, {collection: 'blog'});

module.exports = {
    Blog: mongoose.model('Blog', blogSchema, 'blog')
};
