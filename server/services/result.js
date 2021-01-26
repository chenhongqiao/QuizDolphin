const mongodb = require('../databases/mongodb');

async function getResult(attemptId) {
  const resultsCollection = await mongodb.loadCollection('results');
  return resultsCollection.findOne({ attemptId });
}

module.exports = { getResult };
