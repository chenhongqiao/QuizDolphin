const mongodb = require('../databases/mongodb');
const nanoidUtils = require('../utils/nanoidUtil');
const questionModel = require('../models/questionModel');

class QuestionService {
  static async newQuestion(question) {
    const questionsCollection = await mongodb.loadCollection('questions');
    let questionId = nanoidUtils.charId();
    // Make sure id does not duplicate
    // eslint-disable-next-line no-await-in-loop
    while (await questionsCollection.findOne({ questionId })) {
      questionId = nanoidUtils.charId();
    }
    // Construct question
    const questionData = new questionModel.Question(question, questionId);
    if (questionData.invalid) {
      return { success: false, message: 'Invalid Question Syntax!' };
    }
    // Add question to collection
    questionsCollection.insertOne(questionData);
    return { success: true, data: questionId };
  }

  static async deleteQuestion(questionId) {
    const questionsCollection = await mongodb.loadCollection('questions');
    const status = await questionsCollection.deleteOne({ questionId });
    // 404 if no matching question
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Question!' };
    }
    return { success: true };
  }

  static async updateQuestion(questionId, question) {
    const questionsCollection = await mongodb.loadCollection('questions');
    // Construct question
    const questionData = new questionModel.Question(question, questionId);
    if (questionData.invalid) {
      return { success: false, message: 'Invalid Question Syntax!' };
    }
    // Atomic action, only update affected field
    const status = await questionsCollection.updateOne({ questionId }, { $set: questionData });
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching Question!' };
    }
    return { success: true, data: questionId };
  }

  static async getQuestion(questionId) {
    const questionsCollection = await mongodb.loadCollection('questions');
    const questionCursor = await questionsCollection.find({ questionId }).project({ _id: 0 });
    if (await questionCursor.count() === 0) {
      return { success: false, message: 'No Matching Question!' };
    }
    return { success: true, data: (await questionCursor.toArray())[0] };
  }
}
module.exports = QuestionService;
