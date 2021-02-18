const mongodb = require('../databases/mongodb');

class ResultService {
  static async getResult(attemptId, email, admin) {
    const resultsCollection = await mongodb.loadCollection('results');
    let resultCursor;
    // Make sure record belongs to this user unless action is performed by admin
    if (admin) {
      resultCursor = await resultsCollection.find({ attemptId }).project({ _id: 0 });
    } else {
      resultCursor = await resultsCollection.find({ attemptId, email }).project({ _id: 0 });
    }
    // 404 if no result is found
    if (await resultCursor.count() === 0) {
      return { success: false, message: 'No Matching Result!' };
    }
    const result = (await resultCursor.toArray())[0];
    return { success: true, data: result };
  }
}

module.exports = ResultService;
