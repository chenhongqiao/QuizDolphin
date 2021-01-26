const { DateTime } = require('luxon');

function QuizResult(score, questions, results, totalPoints, attemptId, email, quizId) {
  this.score = score;
  this.totalPoints = totalPoints;
  this.timeStamp = DateTime.local().toUTC().toISO();
  this.questions = questions;
  this.results = results;
  this.attemptId = attemptId;
  this.quizId = quizId;
  this.email = email;
}

function QuestionResult(response, answer, score, questionId, points) {
  this.questionId = questionId;
  this.response = response;
  this.answer = answer;
  this.points = points;
  this.score = score;
}

module.exports = { QuizResult, QuestionResult };
