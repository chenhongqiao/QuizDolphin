const validateUtils = require('../utils/validateUtil');

function QuizInfo(quizInfo, quizId) {
  if (validateUtils.validateQuizInfo(quizInfo)) {
    this.quizName = quizInfo.quizName; // Name of this quiz
    this.quizId = quizId; // ID of this quiz
    this.questionCount = quizInfo.questionCount; // How many questions should be picked
    this.duration = quizInfo.duration; // Quiz duration
    this.maxAttempts = quizInfo.maxAttempts; // How many attempts should be allowed
  } else {
    this.invalid = true;
  }
}

function QuizData(email, questions, answers, duration, attemptId, quizId, quizName, userName) {
  // eslint-disable-next-line max-len
  if (validateUtils.validateQuizData(email, questions, answers, duration, attemptId, quizId, quizName, userName)) {
    this.email = email; // Record email
    this.endTime = new Date(Date.now() + duration * 1000); // Quiz endtime
    this.questions = questions; // Quiz questions
    this.answers = answers; // Quiz answers
    this.attemptId = attemptId; // Attempt ID
    this.quizId = quizId; // The quiz this attempt belongs to
    this.quizName = quizName; // Name of that quiz
    this.userName = userName; // Name of the user taking this attempt
  } else {
    this.invalid = true;
  }
}

function QuizProgress(version, responses, types, attemptId, email, index) {
  if (validateUtils.validateProgress(version, responses, types, attemptId, email, index)) {
    this.version = version; // Version of this progress
    this.email = email; // Email of the person this progress belongs to
    this.types = types; // The type of each question on this attempt
    this.responses = responses; // The user's answer of each question
    this.attemptId = attemptId; // ID of this attempt
    this.index = index; // Which question the user is looking at
  } else {
    this.invalid = true;
  }
}

module.exports = { QuizInfo, QuizData, QuizProgress };
