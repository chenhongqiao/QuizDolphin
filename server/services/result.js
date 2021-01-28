const mongodb = require('../databases/mongodb');

class ResultService {
  static async getResult(attemptId) {
    const resultsCollection = await mongodb.loadCollection('results');
    const resultCursor = await resultsCollection.find({ attemptId });
    if (await resultCursor.count() === 0) {
      return { success: false, message: 'No Matching Result!' };
    }
    return { success: true, data: (await resultCursor.toArray())[0] };
  }
}

module.exports = ResultService;
