const validate = require('../utils/validate');

function Question(question, questionId) {
  if (validate.validateQuestion(question)) {
    this.questionId = questionId;
    this.quizId = question.quizId;
    this.context = question.context;
    this.points = question.points;
    this.type = question.type;
    this.answer = question.answer;
    if (question.type === 'single choice' || question.type === 'multiple choice' || question.type === 'fill in the blanks') {
      this.options = question.options;
    }
    if (question.type === 'matching') {
      this.rightcol = question.rightcol;
      this.leftcol = question.leftcol;
    }
  } else {
    this.invalid = true;
  }
}

module.exports = { Question };
