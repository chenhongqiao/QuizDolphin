const mongodb = require('../databases/mongodb');

class ResultService {
  static async getResult(attemptId, email) {
    const resultsCollection = await mongodb.loadCollection('results');
    const resultCursor = await resultsCollection.find({ attemptId, email }).project({ _id: 0 });
    if (await resultCursor.count() === 0) {
      return { success: false, message: 'No Matching Result!' };
    }
    const result = (await resultCursor.toArray())[0];
    return { success: true, data: result };
  }
}

module.exports = ResultService;
