const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');
const random = require('../utils/random');
const nanoid = require('../utils/nanoid');
const quizModel = require('../models/quiz');

class QuizService {
  static async newAttempt(quizId, email) {
    const questionsCollection = await mongodb.loadCollection('questions');
    if (this.getOngoingId(email, quizId).data) {
      return { success: false, message: 'No Simultaneous Attempts Allowed!' };
    }
    const quizInfoRes = await this.getQuizInfo(quizId);
    if (!quizInfoRes.success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    const quizInfo = quizInfoRes.data;
    const questions = await questionsCollection.find({ quizId }).toArray();
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
    return { success: true, data: attemptId };
  }

  static async getOngoingId(email, quizId) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    // eslint-disable-next-line max-len
    const attemptId = (await attemptsCollection.find({ email, quizId }).project({ attemptId: 1, _id: 0 }).toArray())[0];
    return { success: true, data: attemptId };
  }

  static async getHistoryId(email, quizId) {
    const resultsCollection = await mongodb.loadCollection('results');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    // eslint-disable-next-line max-len
    const results = await resultsCollection.find({
      $query: { email, quizId },
      $orderby: { timeStamp: 1 },
    }).project({ attemptId: 1, _id: 0 }).toArray();
    return { success: true, data: results };
  }

  static async getQuizList() {
    const quizCollection = await mongodb.loadCollection('quizzes');
    return quizCollection.find({}).toArray();
  }

  static async getQuizInfo(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const quizInfoCursor = await quizCollection.find({ quizId }).limit(1);
    if (await quizInfoCursor.count() === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: quizInfoCursor.toArray()[0] };
  }

  static async newQuiz(quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    let quizId = nanoid.numId;
    // eslint-disable-next-line no-await-in-loop
    while (await quizCollection.findOne({ quizId })) {
      quizId = nanoid.numId;
    }
    const quiz = new quizModel.Info(quizInfo, quizId);
    if (quiz.invalid) {
      return { success: false, message: 'Invalid Quiz Syntax!' };
    }
    quizCollection.insertOne(quiz);
    return { success: true, data: quizId };
  }

  static async deleteQuiz(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const status = await quizCollection.deleteOne({ quizId });
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true };
  }

  static async updateQuiz(quizId, quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const status = await quizCollection.updateOne(
      { quizId },
      new quizModel.Info(quizInfo, quizId),
    );
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true };
  }

  static async getQuestions(quizId) {
    const questionsCollection = await mongodb.loadCollection('questions');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: await questionsCollection.find({ quizId }).toArray() };
  }
}
module.exports = QuizService;
