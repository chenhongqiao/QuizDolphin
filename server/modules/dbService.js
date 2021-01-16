const mongodb = require('mongodb');

const clientPromise = mongodb.MongoClient.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function loadCollection(collectionName) {
  const client = await clientPromise;
  if (collectionName === 'users') {
    client.db('test').collection(collectionName).createIndex({ email: 1 }, { unique: true });
  } else if (collectionName === 'quizzes') {
    client.db('test').collection(collectionName).createIndex({ quizId: 1 }, { unique: true });
  } else {
    const type = collectionName.split('-');
    if (type[1] === 'answers' || type[1] === 'questions') {
      client.db('test').collection(collectionName).createIndex({ questionId: 1 }, { unique: true });
    } else if (type[1] === 'attempts' || type[1] === 'results') {
      client.db('test').collection(collectionName).createIndex({ attemptId: 1 }, { unique: true });
      client.db('test').collection(collectionName).createIndex({ email: 1 });
    }
  }
  return client.db('test').collection(collectionName);
}

module.exports = { loadCollection };
