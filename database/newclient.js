const MongoClient = require('mongodb').MongoClient;

const dotenv = require('dotenv');
dotenv.config();

const mongoUrl = process.env.DB_URL

const client = new MongoClient(mongoUrl, {
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(e => {
    console.error('Failed to connect to MongoDB:', e);
    process.exit(1);  // Exit the application with a failure code
  });

const Database = client.db()

module.exports = Database;

