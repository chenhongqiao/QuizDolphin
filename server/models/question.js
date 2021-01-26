function Question(question, questionId) {
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
}

module.exports = { Question };
