const validateUtils = require('../utils/validateUtil');

function Question(question, questionId) {
  if (validateUtils.validateQuestion(question)) {
    this.questionId = questionId; // This question's unique identifier
    this.quizId = question.quizId; // The quiz this question belongs to
    this.context = question.context; // The context of the question
    this.points = question.points; // How many points does this question worth
    this.type = question.type; // The type of this question
    this.answer = question.answer; // The answer of this question
    if (question.type === 'single choice' || question.type === 'multiple choice' || question.type === 'fill in the blanks') {
      this.options = question.options; // This question's options
    }
    if (question.type === 'matching') {
      this.rightcol = question.rightcol; // Right col of matching question
      this.leftcol = question.leftcol; // Left col of matching question
    }
  } else {
    this.invalid = true; // Special: if this question's syntax passed validation
  }
}

module.exports = { Question };
