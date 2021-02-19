const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');
const randomUtils = require('../utils/randomUtil');
const nanoidUtils = require('../utils/nanoidUtil');
const progressUtils = require('../utils/progressUtil');
const quizModel = require('../models/quizModel');

class QuizService {
  static async newAttempt(quizId, email, userName, preview) {
    const questionsCollection = await mongodb.loadCollection('questions');
    const quizInfoRes = await this.getQuizInfo(quizId);
    // Ensure that the quiz requesting exists, is enabled, and there's no
    // attempts from the same user for this quiz going on
    if (!quizInfoRes.success) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    if ((await this.getOngoingId(email, quizId, false, preview)).data.length) {
      return { success: false, message: 'No Simultaneous Attempts Allowed!' };
    }
    const quizInfo = quizInfoRes.data;
    if (!quizInfo.enable && !preview) {
      return { success: false, message: 'Quiz Not Enabled!' };
    }
    if ((await this.getHistoryId(email, quizId)).data.length >= quizInfo.maxAttempts && !preview) {
      return { success: false, message: 'Max Attempts Reached!' };
    }
    // Get questions for this quiz
    const questions = await questionsCollection.find({ quizId })
      .project({ _id: 0 }).sort({ _id: 1 }).toArray();
    const { questionCount } = quizInfo;
    const selectedQuestions = [];
    const selectedAnswers = [];
    if (preview) {
      // If it's admin preview, do not shuffle
      for (let index = 0; index < questions.length; index += 1) {
        const { answer } = questions[index];
        selectedAnswers.push(answer);
        delete questions[index].answer;
        selectedQuestions.push(questions[index]);
      }
    } else {
    // Fisher-Yates shuffle algorithm, creates shuffle questions
      for (let index = questions.length - 1; index >= 1; index -= 1) {
        const pindex = randomUtils.integer(0, index + 1);
        const temp = questions[index];
        questions[index] = questions[pindex];
        questions[pindex] = temp;
      }
      // Get the first several questions (defined by questionCount in quizInfo)
      for (let index = 0; index < questions.length && index < questionCount; index += 1) {
        const { answer } = questions[index];
        selectedAnswers.push(answer);
        delete questions[index].answer;
        selectedQuestions.push(questions[index]);
      }
    }
    const resultsCollection = await mongodb.loadCollection('results');
    const attemptsCollection = await mongodb.loadCollection('attempts');
    // Avoid id duplication
    let attemptId = nanoidUtils.charId();
    // eslint-disable-next-line no-await-in-loop
    while (await resultsCollection.findOne({ attemptId })
      // eslint-disable-next-line no-await-in-loop
      || await attemptsCollection.findOne({ attemptId })) {
      attemptId = nanoidUtils.charId();
    }
    // Construct initial progress
    const initProgress = progressUtils.getInitialProgress(selectedQuestions);
    // COnstruct quiz data
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
    if (preview) {
      quizData.preview = true;
    } else {
      quizData.preview = false;
    }
    const progress = new quizModel.QuizProgress(1,
      initProgress.responses,
      initProgress.types, attemptId, email, 1);
    // Write attempt and progress to database
    await attemptsCollection.insertOne(quizData);
    await redis.set(`progress:${attemptId}`, JSON.stringify(progress));
    await redis.setnx(`endTime:${attemptId}`, quizData.endTime.toISOString());
    return { success: true, data: { attemptId, email, endTime: quizData.endTime } };
  }

  static async getOngoingId(email, quizId, viewAll) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const query = {};
    if (quizId) {
      if (!(await this.getQuizInfo(quizId)).success) {
        return { success: false, message: 'No Matching Quiz!' };
      }
      // If quiz id is specified, search for ongoing attempts under this quiz
      query.quizId = quizId;
    }
    if (!viewAll) {
      // Search under the current user unless this action specifies to view records from all users
      query.email = email;
    } else {
      query.preview = false;
    }
    const ongoing = await attemptsCollection
      .find(query)
      .project({
        attemptId: 1, quizId: 1, quizName: 1, email: 1, userName: 1, _id: 0,
      })
      .toArray();
    return { success: true, data: ongoing };
  }

  static async getHistoryId(email, quizId, viewAll) {
    const resultsCollection = await mongodb.loadCollection('results');
    const query = {};
    if (quizId) {
      if (!(await this.getQuizInfo(quizId)).success) {
        return { success: false, message: 'No Matching Quiz!' };
      }
      // If quiz id is specified, search for ongoing attempts under this quiz
      query.quizId = quizId;
    }
    if (!viewAll) {
      // Search under the current user unless this action specifies to view records from all users
      query.email = email;
    } else {
      query.preview = false;
    }
    // Do not project unecessary info to keep response body small
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

  static async getQuizList() {
    const quizCollection = await mongodb.loadCollection('quizzes');
    // eslint-disable-next-line max-len
    return { success: true, data: await quizCollection.find({}).project({ _id: 0 }).toArray() };
  }

  static async getQuizInfo(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const quizInfoCursor = await quizCollection.find({ quizId }).project({ _id: 0 });
    // Search for quiz info by id, 404 if not found
    if (await quizInfoCursor.count() === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    return { success: true, data: (await quizInfoCursor.toArray())[0] };
  }

  static async newQuiz(quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    // Avoid id duplication
    let quizId = nanoidUtils.charId();
    // eslint-disable-next-line no-await-in-loop
    while (await quizCollection.findOne({ quizId })) {
      quizId = nanoidUtils.charId();
    }
    // Construct quiz
    const quiz = new quizModel.QuizInfo(quizInfo, quizId);
    if (quiz.invalid) {
      return { success: false, message: 'Invalid Quiz Syntax!' };
    }
    // Set default status to disabled
    quiz.enable = false;
    quizCollection.insertOne(quiz);
    return { success: true, data: quizId };
  }

  static async deleteQuiz(quizId) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    const questionsCollection = await mongodb.loadCollection('questions');
    // Delete quiz
    const status = await quizCollection.deleteOne({ quizId });
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching Quiz!' };
    }
    // Delete questions associated to this quiz
    await questionsCollection.deleteMany({ quizId });
    return { success: true };
  }

  static async updateQuiz(quizId, quizInfo) {
    const quizCollection = await mongodb.loadCollection('quizzes');
    // Construct quiz info
    const quiz = new quizModel.QuizInfo(quizInfo, quizId);
    if (quiz.invalid) {
      return { success: false, message: 'Invalid Quiz Syntax!' };
    }
    // Atomic action, only update affected field
    // In this case, 'enable' attribute is ignore
    const status = await quizCollection.updateOne({ quizId }, { $set: quiz });
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
    // Return all question info under this quizId
    // Only some infos are projected to keep response body small
    // Other details should be requested individually by question
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
    // Update quiz status
    const updateCursor = await quizCollection.updateOne(
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
    // Update quiz status
    const updateCursor = await quizCollection.updateOne(
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
