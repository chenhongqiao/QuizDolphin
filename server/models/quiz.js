const validateUtils = require('../utils/validate');

function QuizInfo(quizInfo, quizId) {
  if (validateUtils.validateQuizInfo(quizInfo)) {
    this.quizName = quizInfo.quizName;
    this.quizId = quizId;
    this.questionCount = quizInfo.questionCount;
    this.duration = quizInfo.duration;
  } else {
    this.invalid = true;
  }
}

function QuizData(email, questions, answers, duration, attemptId, quizId) {
  if (validateUtils.validateQuizData(email, questions, answers, duration, attemptId, quizId)) {
    this.email = email;
    this.endTime = Math.floor(Date.now() / 1000) + duration;
    this.questions = questions;
    this.answers = answers;
    this.attemptId = attemptId;
    this.quizId = quizId;
  } else {
    this.invalid = true;
  }
}

function QuizProgress(version, responses, types, attemptId, email, index) {
  if (validateUtils.validateProgress(version, responses, types, attemptId, email, index)) {
    this.version = version;
    this.email = email;
    this.types = types;
    this.responses = responses;
    this.attemptId = attemptId;
    this.index = index;
  } else {
    this.invalid = true;
  }
}

module.exports = { QuizInfo, QuizData, QuizProgress };
