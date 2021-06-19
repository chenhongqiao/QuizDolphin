const mongodb = require('mongodb');

class MongoDB {
  static client;

  static async connect() {
    // Setup indexes on connect
    this.client = await mongodb.MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.db(process.env.MONGO_DBNAME).collection('questions').createIndexes(
      [
        { name: 'quizId', key: { quizId: 1 } },
        { name: 'questionId', key: { questionId: 1 } },
      ],
    );
    this.client.db(process.env.MONGO_DBNAME).collection('quizzes').createIndexes(
      [
        { name: 'quizId', key: { quizId: 1 } },
      ],
    );
    this.client.db(process.env.MONGO_DBNAME).collection('results').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
        { name: 'attemptId', key: { attemptId: 1 } },
      ],
    );
    this.client.db(process.env.MONGO_DBNAME).collection('attempts').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
        { name: 'attemptId', key: { attemptId: 1 } },
      ],
    );
    this.client.db(process.env.MONGO_DBNAME).collection('users').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
      ],
    );
    this.client.db(process.env.MONGO_DBNAME).collection('threads').createIndexes(
      [
        { name: 'threadId', key: { threadId: 1 } },
      ],
    );
  }

  static async loadCollection(collectionName) {
    return this.client.db(process.env.MONGO_DBNAME).collection(collectionName);
  }
}

module.exports = MongoDB;
