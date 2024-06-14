require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.DB_URL

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('We are connected to MongoDB!');
});

module.exports = mongoose;
