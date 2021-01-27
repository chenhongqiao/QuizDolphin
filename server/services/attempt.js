const redis = require('../databases/redis');
const mongodb = require('../databases/mongodb');

async function getProgress(attemptId) {
  const progressString = await redis.get(`progress:${attemptId}`);
  if (!progressString) {
    return { success: false, message: 'No Matching Progress!' };
  }
  const progress = JSON.parse(progressString);
  return { success: true, data: progress };
}

async function postProgress(attemptId, progress) {
  const endTime = await redis.get(`endTime:${attemptId}`);
  if (!endTime) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const quizDataCursor = await attemptsCollection.find({ attemptId }, { endTime: 1, _id: 0 });
    if (!await quizDataCursor.count()) {
      return { success: false, message: 'No Matching Progress!' };
    }
    const quizData = quizDataCursor.toArray()[0];
    if (Math.floor(Date.now() / 1000) <= quizData.endTime) {
      await redis.setnx(`endTime:${quizData.attemptId}`, JSON.stringify(quizData.endTime));
    } else {
      return { success: false, message: 'Quiz Ended!' };
    }
  }
  if (Math.floor(Date.now() / 1000) <= endTime) {
    const currentProgress = JSON.parse((await redis.get(`progress:${attemptId}`)));
    if (!currentProgress || currentProgress.version < progress.version) {
      await redis.set(`progress:${attemptId}`, JSON.stringify(progress));
      return { success: true };
    }
    return { success: false, message: 'Refuse To Overwrite!' };
  }
  return { success: false, message: 'Quiz Ended!' };
}

async function getAttemptData(attemptId) {
  const attemptsCollection = await mongodb.loadCollection('attempts');
  const quizDataCursor = await attemptsCollection.find({ attemptId }, { _id: 0 });
  if (!await quizDataCursor.count()) {
    return { success: false, message: 'No Matching Attempt!' };
  }
  const quizData = quizDataCursor.toArray()[0];
  delete quizData.answers;
  return { success: true, data: quizData };
}

module.exports = { getProgress, postProgress, getAttemptData };
