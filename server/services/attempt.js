const redis = require('../databases/redis');
const mongodb = require('../databases/mongodb');

async function getProgress(attemptId) {
  const progress = JSON.parse(await redis.get(`progress:${attemptId}`));
  return progress;
}

async function postProgress(attemptId, progress) {
  const endTime = await redis.get(`endTime:${attemptId}`);
  if (!endTime) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const QuizData = await attemptsCollection.findOne({ attemptId });
    await redis.setnx(`endTime:${QuizData.attemptId}`, JSON.stringify(QuizData.endTime));
  }
  if (Math.floor(Date.now() / 1000) <= endTime) {
    const currentProgress = JSON.parse((await redis.get(`progress:${attemptId}`)));
    if (!currentProgress || currentProgress.version < progress.version) {
      await redis.set(`progress:${attemptId}`, JSON.stringify(progress));
      return 'Success!';
    }
    return 'Refuse to overwrite!';
  }
  return 'Quiz Ended!';
}

async function getAttemptData(attemptId) {
  const attemptsCollection = await mongodb.loadCollection('attempts');
  const quizData = await attemptsCollection.findOne({ attemptId });
  delete quizData.answers;
  return quizData;
}

module.exports = { getProgress, postProgress, getAttemptData };
