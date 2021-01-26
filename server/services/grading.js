const mongodb = require('../databases/mongodb');
const redis = require('../databases/redis');

const resultModel = require('../models/result');

async function gradeQuiz(attemptId, email) {
  const attemptsCollection = await mongodb.loadCollection('attempts');
  const resultsCollection = await mongodb.loadCollection('results');
  const attemptData = (await attemptsCollection.findOne({ attemptId }));
  const { responses } = JSON.parse(await redis.get(`progress:${attemptId}`));
  const results = [];
  const { questions } = attemptData;
  const { answers } = attemptData;
  let totalPoints = 0;
  let score = 0;
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const response = responses[index];
    const answer = answers[index];
    totalPoints += question.points;
    // Grade single choice and short response questions
    if (question.type === 'single choice' || question.type === 'short response') {
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

    // Grade multiple choice questions
    if (question.type === 'multiple choice') {
      const answersSet = new Set(answer);
      // Points are proportional to how many correction opions are chosen.
      // Additionally, user get 0 for the entire question if incorrect options are chosen.
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
  }
  const quizResult = new resultModel.QuizResult(score, questions,
    results, totalPoints, attemptId, email, attemptData.quizId);
  await resultsCollection.insertOne(quizResult);
  await attemptsCollection.deleteOne({ attemptId });
  await redis.del(`progress:${attemptId}`);
  await redis.del(`endTime:${attemptId}`);
  return attemptId;
}

module.exports = { gradeQuiz };