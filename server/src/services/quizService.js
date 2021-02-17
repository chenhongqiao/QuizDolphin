const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');
const randomUtils = require('../utils/randomUtil');
const nanoidUtils = require('../utils/nanoidUtil');
const progressUtils = require('../utils/progressUtil');
const quizModel = require('../models/quizModel');

class QuizService {
  static async newAttempt(quizId, email, userName, admin) {
    const questionsCollection = await mongodb.loadCollection('questions');
    if ((await this.getOngoingId(email, quizId, false)).data.length) {
      return { success: false, message: 'No Simultaneous Attempts Allowed!' };
    }
    const quizInfoRes = await this.getQuizInfo(quizId, admin);
    if (!quizInfoRes.success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    const quizInfo = quizInfoRes.data;
    const questions = await questionsCollection.find({ quizId }).project({ _id: 0 }).toArray();
    const { questionCount } = quizInfo;
    const selectedQuestions = [];
    const selectedAnswers = [];
    // Fisher-Yates shuffle algorithm
    // Time-complexity: O(n) n=total question number
    for (let index = questions.length - 1; index >= 1; index -= 1) {
      const pindex = randomUtils.integer(0, index + 1);
      const temp = questions[index];
      questions[index] = questions[pindex];
      questions[pindex] = temp;
    }
    for (let index = 0; index < questions.length && index < questionCount; index += 1) {
      const { answer } = questions[index];
      selectedAnswers.push(answer);
      delete questions[index].answer;
      selectedQuestions.push(questions[index]);
    }
    const resultsCollection = await mongodb.loadCollection('results');
    const attemptsCollection = await mongodb.loadCollection('attempts');
    let attemptId = nanoidUtils.numId();
    // eslint-disable-next-line no-await-in-loop
    while (await resultsCollection.findOne({ attemptId })
      // eslint-disable-next-line no-await-in-loop
      || await attemptsCollection.findOne({ attemptId })) {
      attemptId = nanoidUtils.numId();
    }
    const initProgress = progressUtils.getInitialProgress(selectedQuestions);
    const quizData = new quizModel.QuizData(
      email,
      selectedQuestions,
      selectedAnswers,
      quizInfo.duration,
      attemptId,
      quizId,
      quizInfo.quizName,
      userName,
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

  static async getOngoingId(email, quizId, admin) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const query = {};
    if (quizId) {
      if (!(await this.getQuizInfo(quizId)).success) {
        return { success: false, message: 'No Matching Quiz!' };
      }
      query.quizId = quizId;
    }
    if (!admin) {
      query.email = email;
    }
    const ongoing = await attemptsCollection
      .find(query)
      .project({
        attemptId: 1, quizId: 1, quizName: 1, email: 1, userName: 1, _id: 0,
      })
      .toArray();
    return { success: true, data: ongoing };
  }

  static async getHistoryId(email, quizId, admin) {
    const resultsCollection = await mongodb.loadCollection('results');
    const query = {};
    if (quizId) {
      if (!(await this.getQuizInfo(quizId)).success) {
        return { success: false, message: 'No Matching Quiz!' };
      }
      query.quizId = quizId;
    }
    if (!admin) {
      query.email = email;
    }
    const history = await resultsCollection.find({
      $query: query,
      $orderby: { timeStamp: 1 },
    }).project({
      attemptId: 1,
      timeStamp: 1,
      score: 1,
      totalPoints: 1,
      quizId: 1,
      quizName: 1,
      email: 1,
      userName: 1,
      _id: 0,
    }).toArray();
    return { success: true, data: history };
  }

  static async getQuizList(admin) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    if (admin) {
      return { success: true, data: await quizCollection.find({}).project({ _id: 0 }).toArray() };
    }
    // eslint-disable-next-line max-len
    return { success: true, data: await quizCollection.find({ enable: true }).project({ _id: 0 }).toArray() };
  }

  static async getQuizInfo(quizId, admin) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    let quizInfoCursor;
    if (admin) {
      quizInfoCursor = await quizCollection.find({ quizId }).project({ _id: 0 });
    } else {
      quizInfoCursor = await quizCollection.find({ quizId, enable: true }).project({ _id: 0 });
    }
    if (await quizInfoCursor.count() === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: (await quizInfoCursor.toArray())[0] };
  }

  static async newQuiz(quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    let quizId = nanoidUtils.numId();
    // eslint-disable-next-line no-await-in-loop
    while (await quizCollection.findOne({ quizId })) {
      quizId = nanoidUtils.numId();
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
    const questionsCollection = await mongodb.loadCollection('questions');
    const status = await quizCollection.deleteOne({ quizId });
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    await questionsCollection.deleteMany({ quizId });
    return { success: true };
  }

  static async updateQuiz(quizId, quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const quiz = new quizModel.QuizInfo(quizInfo, quizId);
    if (quiz.invalid) {
      return { success: false, message: 'Invalid Quiz Syntax!' };
    }
    const status = await quizCollection.replaceOne({ quizId }, quiz);
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
      data: await questionsCollection.find({ quizId })
        .project({
          questionId: 1, type: 1, points: 1, _id: 0,
        }).sort({ id: 1 }).toArray(),
    };
  }

  static async enableQuiz(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const updateCursor = await quizCollection.update(
      { quizId },
      {
        $set: {
          enable: true,
        },
      },
    );
    if (updateCursor.matchedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true };
  }

  static async disableQuiz(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const updateCursor = await quizCollection.update(
      { quizId },
      {
        $set: {
          enable: false,
        },
      },
    );
    if (updateCursor.matchedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true };
  }
}
module.exports = QuizService;
