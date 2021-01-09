const mongodb = require('mongodb');

const clientPromise = mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function loadCollection(collectionName) {
  const client = await clientPromise;
  return client.db('server').collection(collectionName);
}

module.exports = { loadCollection };
