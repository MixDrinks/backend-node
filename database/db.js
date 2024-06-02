require('dotenv').config();
const mongoose = require('mongoose');

const dbUser = process.env.DB_USER;
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: dbName,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('We are connected to MongoDB!');
});

module.exports = mongoose;
