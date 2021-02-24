const validateUtils = require('../utils/validateUtil');

function QuizResult(score, questions, results, totalPoints,
  attemptId, email, quizId, quizName, userName) {
  if (validateUtils.validateQuizResult(score, questions, results,
    totalPoints, attemptId, email, quizId, quizName, userName)) {
    this.score = score; // Score of this attempt
    this.totalPoints = totalPoints; // Toatal points of questions on this attempt
    this.timeStamp = (new Date()).toISOString(); // Time this attempt is graded
    this.questions = questions; // questions on this attempt
    this.results = results; // results of each question, including user's answer and the correct
    this.attemptId = attemptId; // ID of this attempt
    this.quizId = quizId; // quiz id of this attempt
    this.email = email; // email of the person this attempt belongs to
    this.quizName = quizName; // Name of the quiz this attempt belongs to
    this.userName = userName; // Name of the person this attempt belongs to
  } else {
    this.invalid = true;
  }
}

function QuestionResult(response, answer, score, questionId, points) {
  if (validateUtils.validateQuestionResult(response, answer, score, questionId, points)) {
    this.questionId = questionId; // ID of question this result is assosiated with
    this.response = response; // User's answer on this question
    this.answer = answer; // Correct answer on this question
    this.points = points; // Points this question worth
    this.score = score; // Points the user got on this question
  } else {
    this.invalid = true;
  }
}

module.exports = { QuizResult, QuestionResult };
