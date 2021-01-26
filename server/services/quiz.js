const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');
const random = require('../utils/random');
const nanoid = require('../utils/nanoid');
const quizModel = require('../models/quiz');

async function newAttempt(quizId, email) {
  const questionsCollection = await mongodb.loadCollection('questions');
  const quizCollection = await mongodb.loadCollection('quizzes');
  const questions = await questionsCollection.find({ quizId }).toArray();
  const quizInfo = await quizCollection.findOne({ quizId });
  const { questionCount } = quizInfo;
  const selectedQuestions = [];
  const selectedAnswers = [];
  const selectedIndexes = new Set();
  while (selectedQuestions.length < questionCount) {
    // console.log(selectedQuestions.length);
    const index = random.integer(0, questions.length);
    if (!selectedIndexes.has(index)) {
      const { answer } = questions[index];
      selectedAnswers.push(answer);
      delete questions[index].answer;
      selectedQuestions.push(questions[index]);
      selectedIndexes.add(index);
    }
  }
  const resultsCollection = await mongodb.loadCollection('results');
  const attemptsCollection = await mongodb.loadCollection('attempts');
  let attemptId = nanoid.charId();
  // eslint-disable-next-line no-await-in-loop
  while (await resultsCollection.findOne({ attemptId })
      // eslint-disable-next-line no-await-in-loop
      || await attemptsCollection.findOne({ attemptId })) {
    attemptId = nanoid.charId();
  }
  const responses = [];
  selectedQuestions.forEach((question, index) => {
    if (question.type === 'single choice' || question.type === 'short response') {
      responses[index] = '';
    } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
      responses[index] = [];
    }
  });
  const quizData = new quizModel.Data(
    email,
    selectedQuestions,
    selectedAnswers,
    quizInfo.duration,
    attemptId,
    quizId,
  );
  const initialProgress = new quizModel.Progress(1, responses, attemptId);
  await attemptsCollection.insertOne(quizData);
  await redis.set(`progress:${attemptId}`, JSON.stringify(initialProgress));
  await redis.setnx(`endTime:${attemptId}`, JSON.stringify(quizData.endTime));
  return attemptId;
}

async function quizAttemptId(email, quizId) {
  const attemptsCollection = await mongodb.loadCollection('attempts');
  // eslint-disable-next-line max-len
  const attemptId = (await attemptsCollection.find({ email, quizId }).project({ attemptId: 1, _id: 0 }).toArray())[0];
  return attemptId;
}

async function quizResults(email, quizId) {
  const resultsCollection = await mongodb.loadCollection('results');
  // eslint-disable-next-line max-len
  const results = await resultsCollection.find({
    $query: { email, quizId },
    $orderby: { timeStamp: 1 },
  }).project({ attemptId: 1, _id: 0 }).toArray();
  return results;
}

async function quizList() {
  const quizCollection = await mongodb.loadCollection('quizzes');
  return quizCollection.find({}).toArray();
}

async function newQuiz(quizInfo) {
  const quizCollection = await mongodb.loadCollection('quizzes');
  return quizCollection.insertOne(new quizModel.Info(quizInfo, nanoid.numId));
}

async function deleteQuiz(quizId) {
  const quizCollection = await mongodb.loadCollection('quizzes');
  return quizCollection.deleteOne({ quizId });
}

async function updateQuiz(quizId, quizInfo) {
  const quizCollection = await mongodb.loadCollection('quizzes');
  return quizCollection.updateOne(
    { quizId },
    new quizModel.Info(quizInfo, quizId),
  );
}

async function getQuestions(quizId) {
  const questionsCollection = await mongodb.loadCollection('questions');
  return questionsCollection.find({ quizId }).toArray;
}

module.exports = {
  newAttempt, quizAttemptId, quizResults, quizList, newQuiz, deleteQuiz, updateQuiz, getQuestions,
};
