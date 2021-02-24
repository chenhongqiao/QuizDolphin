const mongodb = require('mongodb');

class MongoDB {
  static client;

  static async connect() {
    // Setup indexes on connect
    this.client = await mongodb.MongoClient.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.db(process.env.MONGODBNAME).collection('questions').createIndexes(
      [
        { name: 'quizId', key: { quizId: 1 } },
        { name: 'questionId', key: { questionId: 1 } },
      ],
    );
    this.client.db(process.env.MONGODBNAME).collection('quizzes').createIndexes(
      [
        { name: 'quizId', key: { quizId: 1 } },
      ],
    );
    this.client.db(process.env.MONGODBNAME).collection('results').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
        { name: 'attemptId', key: { attemptId: 1 } },
      ],
    );
    this.client.db(process.env.MONGODBNAME).collection('attempts').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
        { name: 'attemptId', key: { attemptId: 1 } },
      ],
    );
    this.client.db(process.env.MONGODBNAME).collection('users').createIndexes(
      [
        { name: 'email', key: { email: 1 } },
      ],
    );
  }

  static async loadCollection(collectionName) {
    return this.client.db(process.env.MONGODBNAME).collection(collectionName);
  }
}

module.exports = MongoDB;
