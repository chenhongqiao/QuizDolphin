const mongodb = require('../databases/mongodb');
const nanoid = require('../utils/nanoid');
const questionModel = require('../models/question');

async function newQuestion(question) {
  const questionsCollection = await mongodb.loadCollection('questions');
  let questionId = nanoid.charId();
  // eslint-disable-next-line no-await-in-loop
  while (await questionsCollection.findOne({ questionId })) {
    questionId = nanoid.charId();
  }
  return questionsCollection.insertOne(new questionModel.Question(question, questionId));
}

async function deleteQuestion(questionId) {
  const questionsCollection = await mongodb.loadCollection('questions');
  return questionsCollection.deleteOne({ questionId });
}

async function updateQuestion(questionId, question) {
  const questionsCollection = await mongodb.loadCollection('questions');
  return questionsCollection.updateOne({ questionId },
    new questionModel.Question(question, questionId));
}

module.exports = { newQuestion, deleteQuestion, updateQuestion };
