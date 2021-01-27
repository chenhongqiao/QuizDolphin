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
  const questionData = questionModel.Question(question, questionId);
  if (questionData.invalid) {
    return { success: false, message: 'Incorrect Question Syntax!' };
  }
  questionsCollection.insertOne(questionData);
  return { success: true, data: questionId };
}

async function deleteQuestion(questionId) {
  const questionsCollection = await mongodb.loadCollection('questions');
  const status = await questionsCollection.deleteOne({ questionId });
  if (status.deletedCount === 0) {
    return { success: false, message: 'No Matching Question!' };
  }
  return { success: true };
}

async function updateQuestion(questionId, question) {
  const questionsCollection = await mongodb.loadCollection('questions');
  const questionData = questionModel.Question(question, questionId);
  if (questionData.invalid) {
    return { success: false, message: 'Incorrect Question Syntax!' };
  }
  const status = await questionsCollection.updateOne({ questionId }, questionData);
  if (status.matchedCount === 0) {
    return { success: false, message: 'No Matching Question!' };
  }
  return { success: true };
}

module.exports = { newQuestion, deleteQuestion, updateQuestion };
