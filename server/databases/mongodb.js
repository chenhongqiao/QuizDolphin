const mongodb = require('mongodb');

const clientPromise = mongodb.MongoClient.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function loadCollection(collectionName) {
  const client = await clientPromise;
  return client.db('test').collection(collectionName);
}

module.exports = { loadCollection };
