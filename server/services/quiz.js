const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');
const randomUtils = require('../utils/random');
const nanoidUtils = require('../utils/nanoid');
const progressUtils = require('../utils/progress');
const quizModel = require('../models/quiz');

class QuizService {
  static async newAttempt(quizId, email) {
    const questionsCollection = await mongodb.loadCollection('questions');
    if ((await this.getOngoingId(email, quizId)).data) {
      return { success: false, message: 'No Simultaneous Attempts Allowed!' };
    }
    const quizInfoRes = await this.getQuizInfo(quizId);
    if (!quizInfoRes.success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    const quizInfo = quizInfoRes.data;
    const questions = await questionsCollection.find({ quizId }).project({ _id: 0 }).toArray();
    const { questionCount } = quizInfo;
    const selectedQuestions = [];
    const selectedAnswers = [];
    const selectedIndexes = new Set();
    while (selectedQuestions.length < questionCount) {
      const index = randomUtils.integer(0, questions.length);
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
    let attemptId = nanoidUtils.charId();
    // eslint-disable-next-line no-await-in-loop
    while (await resultsCollection.findOne({ attemptId })
      // eslint-disable-next-line no-await-in-loop
      || await attemptsCollection.findOne({ attemptId })) {
      attemptId = nanoidUtils.charId();
    }
    const initProgress = progressUtils.getInitialProgress(selectedQuestions);
    const quizData = new quizModel.QuizData(
      email,
      selectedQuestions,
      selectedAnswers,
      quizInfo.duration,
      attemptId,
      quizId,
    );
    if (quizData.invalid) {
      throw new Error('Failed Generating QuizData!');
    }
    const progress = new quizModel.QuizProgress(1,
      initProgress.responses,
      initProgress.types, attemptId, email, 1);
    await attemptsCollection.insertOne(quizData);
    await redis.set(`progress:${attemptId}`, JSON.stringify(progress));
    await redis.setnx(`endTime:${attemptId}`, quizData.endTime.toISOString());
    return { success: true, data: { attemptId, email, endTime: quizData.endTime } };
  }

  static async getOngoingId(email, quizId) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    const attemptId = (await attemptsCollection
      .find({ email, quizId })
      .project({ attemptId: 1, _id: 0 })
      .toArray())[0];
    return { success: true, data: attemptId };
  }

  static async getHistoryId(email, quizId) {
    const resultsCollection = await mongodb.loadCollection('results');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    const results = await resultsCollection.find({
      $query: { email, quizId },
      $orderby: { timeStamp: 1 },
    }).project({
      attemptId: 1, timeStamp: 1, score: 1, _id: 0,
    }).toArray();
    return { success: true, data: results };
  }

  static async getQuizList() {
    const quizCollection = await mongodb.loadCollection('quizzes');
    return { success: true, data: await quizCollection.find({}).project({ _id: 0 }).toArray() };
  }

  static async getQuizInfo(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const quizInfoCursor = await quizCollection.find({ quizId }).project({ _id: 0 });
    if (await quizInfoCursor.count() === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: (await quizInfoCursor.toArray())[0] };
  }

  static async newQuiz(quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    let quizId = nanoidUtils.numId;
    // eslint-disable-next-line no-await-in-loop
    while (await quizCollection.findOne({ quizId })) {
      quizId = nanoidUtils.numId;
    }
    const quiz = new quizModel.QuizInfo(quizInfo, quizId);
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
    const quiz = new quizModel.QuizInfo(quizInfo, quizId);
    if (quiz.invalid) {
      return { success: false, message: 'Invalid Quiz Syntax!' };
    }
    const status = await quizCollection.updateOne({ quizId }, quiz);
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: quizId };
  }

  static async getQuestions(quizId) {
    const questionsCollection = await mongodb.loadCollection('questions');
    if (!(await this.getQuizInfo(quizId)).success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return {
      success: true,
      data: await questionsCollection.find({ quizId }).project({ _id: 0 }).toArray(),
    };
  }
}
module.exports = QuizService;
