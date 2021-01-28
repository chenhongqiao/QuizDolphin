const mongodb = require('../databases/mongodb');
const nanoid = require('../utils/nanoid');
const questionModel = require('../models/question');

class QuestionService {
  static async newQuestion(question) {
    const questionsCollection = await mongodb.loadCollection('questions');
    let questionId = nanoid.charId();
    // eslint-disable-next-line no-await-in-loop
    while (await questionsCollection.findOne({ questionId })) {
      questionId = nanoid.charId();
    }
    const questionData = new questionModel.Question(question, questionId);
    if (questionData.invalid) {
      return { success: false, message: 'Incorrect Question Syntax!' };
    }
    questionsCollection.insertOne(questionData);
    return { success: true, data: questionId };
  }

  static async deleteQuestion(questionId) {
    const questionsCollection = await mongodb.loadCollection('questions');
    const status = await questionsCollection.deleteOne({ questionId });
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Question!' };
    }
    return { success: true };
  }

  static async updateQuestion(questionId, question) {
    const questionsCollection = await mongodb.loadCollection('questions');
    const questionData = new questionModel.Question(question, questionId);
    if (questionData.invalid) {
      return { success: false, message: 'Incorrect Question Syntax!' };
    }
    const status = await questionsCollection.updateOne({ questionId }, questionData);
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching Question!' };
    }
    return { success: true };
  }
}
module.exports = QuestionService;
