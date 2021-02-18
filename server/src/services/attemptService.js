const redis = require('../databases/redis');
const mongodb = require('../databases/mongodb');
const quizModel = require('../models/quizModel');

class AttemptService {
  static async getProgress(attemptId, email) {
    // Get progress by if this progress belongs to this user
    const progressString = await redis.get(`progress:${attemptId}`);
    if (!progressString) {
      return { success: false, message: 'No Matching Progress!' };
    }
    const progress = JSON.parse(progressString);
    if (progress.email !== email) {
      return { success: false, message: 'No Matching Progress!' };
    }
    return { success: true, data: progress };
  }

  static async putProgress(attemptId, progress, email) {
    // Get endtime from redis and make sure quiz is not ended
    const endTime = Date.parse(await redis.get(`endTime:${attemptId}`));
    if (endTime && Date.now() <= endTime) {
      const currentProgress = JSON.parse((await redis.get(`progress:${attemptId}`)));
      // Get progress by if this progress belongs to this user
      if (!currentProgress || currentProgress.email !== email) {
        return { success: false, message: 'No Matching Progress!' };
      }
      // Only update progress if the version is newer than the one stored
      if (currentProgress.version < progress.version) {
        // Construct progress
        const newProgress = new quizModel.QuizProgress(
          progress.version,
          progress.responses,
          currentProgress.types,
          currentProgress.attemptId,
          currentProgress.email,
          progress.index,
        );
        if (newProgress.invalid) {
          return { success: false, message: 'Invalid Progress Syntax!' };
        }
        await redis.set(`progress:${attemptId}`, JSON.stringify(newProgress));
        return { success: true };
      }
      return { success: false, message: 'Refuse To Overwrite!' };
    }
    return { success: false, message: 'Quiz Ended!' };
  }

  static async getAttemptData(attemptId, email) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const resultsCollection = await mongodb.loadCollection('results');
    // Find attempt data by both attemptId and email, to make sure the data belongs to this user
    const quizDataCursor = await attemptsCollection.find({ attemptId, email }).project({ _id: 0 });
    /*
      If attempt is not found in attempts collection but results collection, notify client
      quiz has ended and result page should be shown. 404 other wise.
    */
    if (await quizDataCursor.count() === 0) {
      if (await resultsCollection.find({ attemptId, email }).project({ _id: 0 }).count()) {
        return { success: false, message: 'Quiz Ended!' };
      }
      return { success: false, message: 'No Matching Attempt!' };
    }
    const quizData = (await quizDataCursor.toArray())[0];
    delete quizData.answers;
    return { success: true, data: quizData };
  }
}

module.exports = AttemptService;
