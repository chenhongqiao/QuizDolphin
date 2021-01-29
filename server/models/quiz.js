function Info(quizInfo, quizId) {
  this.quizName = quizInfo.quizName;
  this.quizId = quizId;
  this.questionCount = quizInfo.questionCount;
  this.duration = quizInfo.duration;
}

function Data(email, questions, answers, duration, attemptId, quizId) {
  this.email = email;
  this.endTime = Math.floor(Date.now() / 1000) + duration;
  this.questions = questions;
  this.answers = answers;
  this.attemptId = attemptId;
  this.quizId = quizId;
}

function Progress(version, responses, attemptId, email) {
  this.version = version;
  this.email = email;
  this.responses = responses;
  this.attemptId = attemptId;
  this.index = 1;
}

module.exports = { Info, Data, Progress };
