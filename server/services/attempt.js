const redis = require('../databases/redis');
const mongodb = require('../databases/mongodb');

class AttemptService {
  static async getProgress(attemptId, email) {
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

  static async postProgress(attemptId, progress, email) {
    const endTime = await redis.get(`endTime:${attemptId}`);
    if (!endTime) {
      const attemptsCollection = await mongodb.loadCollection('attempts');
      const quizDataCursor = await attemptsCollection.find(
        { attemptId, email },
        { endTime: 1, _id: 0 },
      );
      if (!await quizDataCursor.count()) {
        return { success: false, message: 'No Matching Progress!' };
      }
      const quizData = (await quizDataCursor.toArray())[0];
      if (Math.floor(Date.now() / 1000) <= quizData.endTime) {
        await redis.setnx(`endTime:${quizData.attemptId}`, JSON.stringify(quizData.endTime));
      } else {
        return { success: false, message: 'Quiz Ended!' };
      }
    }
    if (Math.floor(Date.now() / 1000) <= endTime) {
      const currentProgress = JSON.parse((await redis.get(`progress:${attemptId}`)));
      if (currentProgress.email !== email) {
        return { success: false, message: 'No Matching Progress!' };
      }
      if (!currentProgress || currentProgress.version < progress.version) {
        await redis.set(`progress:${attemptId}`, JSON.stringify(progress));
        return { success: true };
      }
      return { success: false, message: 'Refuse To Overwrite!' };
    }
    return { success: false, message: 'Quiz Ended!' };
  }

  static async getAttemptData(attemptId, email) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const quizDataCursor = await attemptsCollection.find({ attemptId, email }, { _id: 0 });
    if (!await quizDataCursor.count()) {
      return { success: false, message: 'No Matching Attempt!' };
    }
    const quizData = (await quizDataCursor.toArray())[0];
    delete quizData.answers;
    return { success: true, data: quizData };
  }
}

module.exports = AttemptService;
