const validateUtils = require('../utils/validateUtil');

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

function QuizData(email, questions, answers, duration, attemptId, quizId, quizName, userName) {
  // eslint-disable-next-line max-len
  if (validateUtils.validateQuizData(email, questions, answers, duration, attemptId, quizId, quizName, userName)) {
    this.email = email;
    this.endTime = new Date(Date.now() + duration * 1000);
    this.questions = questions;
    this.answers = answers;
    this.attemptId = attemptId;
    this.quizId = quizId;
    this.quizName = quizName;
    this.userName = userName;
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
