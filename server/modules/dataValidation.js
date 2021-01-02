function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

function validateQuestion(question) {
  if (!question.context || !question.type
    || !question.points || !question.answer) {
    throw new UserException('Missing Question Property!');
  }
  if (question.uuid) {
    throw new UserException('Request Should Not Specify UUID!');
  }
  if (question.type !== 'single choice' && question.type !== 'multiple choice' && question.type !== 'short response'
    && question.type !== 'matching' && question.type !== 'fill in the blanks') {
    throw new UserException('Invalid Question Type!');
  }
  if (question.type === 'single choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || typeof question.answer !== 'string') {
      throw new UserException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'multiple choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || !Array.isArray(question.answer)) {
      throw new UserException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'short response') {
    if (typeof question.context !== 'string' || typeof question.answer !== 'string') {
      throw new UserException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'matching') {
    if (typeof question.context !== 'string' || !Array.isArray(question.answer)
      || !Array.isArray(question.leftcol) || !Array.isArray(question.rightcol)) {
      throw new UserException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'fill in the blanks') {
    if (!Array.isArray(question.context) || !Array.isArray(question.answer)
      || !Array.isArray(question.options)) {
      throw new UserException('Incorrect Question Property Type!');
    }
    question.options.forEach((value) => {
      if (!Array.isArray(value)) {
        throw new UserException('Incorrect Question Property Type!');
      }
    });
  }
}

module.exports = { validateQuestion };
