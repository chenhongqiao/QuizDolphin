const mongodb = require('mongodb');

class MongoDB {
  static client;

  static async connect() {
    this.client = await mongodb.MongoClient.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  static async loadCollection(collectionName) {
    return this.client.db('test').collection(collectionName);
  }
}

module.exports = MongoDB;
