const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside your Vercel project settings.');
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Extract database name from URI or default to "studytrack"
  const dbName = uri.split('/').pop().split('?')[0] || 'studytrack';
  const db = client.db(dbName);

  cachedDb = db;
  return db;
}

module.exports = { connectToDatabase };
