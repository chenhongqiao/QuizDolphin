const { DateTime } = require('luxon');
const validateUtils = require('../utils/validate');

function QuizResult(score, questions, results, totalPoints, attemptId, email, quizId, quizName) {
  if (validateUtils.validateQuizResult(score, questions, results,
    totalPoints, attemptId, email, quizId, quizName)) {
    this.score = score;
    this.totalPoints = totalPoints;
    this.timeStamp = DateTime.local().toUTC().toISO();
    this.questions = questions;
    this.results = results;
    this.attemptId = attemptId;
    this.quizId = quizId;
    this.email = email;
    this.quizName = quizName;
  } else {
    this.invalid = true;
  }
}

function QuestionResult(response, answer, score, questionId, points) {
  if (validateUtils.validateQuestionResult(response, answer, score, questionId, points)) {
    this.questionId = questionId;
    this.response = response;
    this.answer = answer;
    this.points = points;
    this.score = score;
  } else {
    this.invalid = true;
  }
}

module.exports = { QuizResult, QuestionResult };
