const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');

const resultModel = require('../models/resultModel');

class GradingService {
  static async gradeQuiz(attemptId, email) {
    const attemptsCollection = await mongodb.loadCollection('attempts');
    const resultsCollection = await mongodb.loadCollection('results');
    /*
      If attempt is not found in attempts collection but results collection, notify client
      quiz has ended and result page should be shown. 404 other wise.
    */
    const attemptDataCursor = await attemptsCollection
      .find({ attemptId, email }).project({ _id: 0 });
    if (await attemptDataCursor.count() === 0) {
      if (await resultsCollection.find({ attemptId, email }).project({ _id: 0 }).count()) {
        return { success: false, message: 'Quiz Ended!' };
      }
      return { success: false, message: 'No Matching Attempt!' };
    }
    const attemptData = (await attemptDataCursor.toArray())[0];
    // Destruct user responses, questions and answers
    // Get response directly from the entry in redis, AKA progress.
    const { responses } = JSON.parse(await redis.get(`progress:${attemptId}`));
    const results = [];
    const { questions } = attemptData;
    const { answers } = attemptData;
    const { preview } = attemptData;
    let totalPoints = 0;
    let score = 0;
    // Loop through questions
    for (let index = 0; index < questions.length; index += 1) {
      /* When comparing user's response to the correct answer,
      program ensures that they are always string.
      */
      const question = questions[index];
      const response = responses[index];
      const answer = answers[index];
      totalPoints += question.points;
      // Grade single choice and short response questions
      if (question.type === 'single choice') {
      // Gain full points only if user's input match exactly with correct answer
        if (answer === response) {
          results.push(new resultModel.QuestionResult(
            response, answer, question.points,
            question.questionId, question.points,
          ));
          score += question.points;
        } else {
          results.push(new resultModel.QuestionResult(
            response, answer, 0, question.questionId, question.points,
          ));
        }
      }
      if (question.type === 'short response') {
        if (answer.trim().toLowerCase() === response.trim().toLowerCase()) {
          results.push(new resultModel.QuestionResult(
            response, answer, question.points,
            question.questionId, question.points,
          ));
          score += question.points;
        } else {
          results.push(new resultModel.QuestionResult(
            response, answer, 0, question.questionId, question.points,
          ));
        }
      }
      // Grade multiple choice questions
      if (question.type === 'multiple choice') {
        const answersSet = new Set(answer);
        // Points are proportional to how many correct opions are chosen
        // Additionally, user get 0 for the entire question if incorrect options are chosen
        const correctCount = response.reduce((count, option) => {
          if (answersSet.has(option)) {
            return count + 1;
          }
          return -Infinity;
        }, 0);
        if (correctCount < 0) {
          results.push(new resultModel.QuestionResult(
            response, answer, 0, question.questionId, question.points,
          ));
        } else {
          results.push(new resultModel.QuestionResult(
            response, answer,
            question.points * (correctCount / answersSet.size),
            question.questionId, question.points,
          ));
          score += question.points * (correctCount / answersSet.size);
        }
      }

      if (question.type === 'matching') {
        // Points are proportional to how many correct matches are made
        const correctMatch = response.reduce((count, option, optionIndex) => {
          if (option === answer[optionIndex]) {
            return count + 1;
          }
          return count;
        }, 0);
        results.push(new resultModel.QuestionResult(
          response, answer,
          question.points * (correctMatch / answer.length),
          question.questionId, question.points,
        ));
        score += question.points * (correctMatch / answer.length);
      }

      if (question.type === 'fill in the blanks') {
        // Points are proportional to how many blanks are filled correctly
        const correctMatch = response.reduce((count, option, optionIndex) => {
          if (option === answer[optionIndex]) {
            return count + 1;
          }
          return count;
        }, 0);
        results.push(new resultModel.QuestionResult(
          response, answer,
          question.points * (correctMatch / answer.length),
          question.questionId, question.points,
        ));
        score += question.points * (correctMatch / answer.length);
      }
      if (results[index].invalid) {
        throw Error('Error Generating Quiz Result!');
      }
    }
    // Construct quiz result
    const quizResult = new resultModel.QuizResult(score, questions,
      results, totalPoints, attemptId, email, attemptData.quizId,
      attemptData.quizName, attemptData.userName);
    if (quizResult.invalid) {
      throw Error('Error Generating Quiz Result!');
    }
    if (preview) {
      quizResult.preview = true;
    } else {
      quizResult.preview = false;
    }
    // Add quiz result to collection
    await resultsCollection.insertOne(quizResult);
    // Clear up ongoing attempt
    await attemptsCollection.deleteOne({ attemptId });
    await redis.del(`progress:${attemptId}`);
    await redis.del(`endTime:${attemptId}`);
    return { success: true, data: attemptId };
  }
}
module.exports = GradingService;
