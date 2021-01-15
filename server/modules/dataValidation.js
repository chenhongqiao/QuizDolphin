class ClientException {
  constructor(message) {
    this.message = message;
    this.type = 'ClientException';
  }
}

function validateQuestion(question) {
  if (!question.context || !question.type
    || !question.points || !question.answer) {
    throw new ClientException('Missing Question Property!');
  }
  if (question.questionId) {
    throw new ClientException('Request Should Not Specify questionId!');
  }
  if (question.type !== 'single choice' && question.type !== 'multiple choice' && question.type !== 'short response'
    && question.type !== 'matching' && question.type !== 'fill in the blanks') {
    throw new ClientException('Invalid Question Type!');
  }
  if (question.type === 'single choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || typeof question.answer !== 'string') {
      throw new ClientException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'multiple choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || !Array.isArray(question.answer)) {
      throw new ClientException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'short response') {
    if (typeof question.context !== 'string' || typeof question.answer !== 'string') {
      throw new ClientException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'matching') {
    if (typeof question.context !== 'string' || !Array.isArray(question.answer)
      || !Array.isArray(question.leftcol) || !Array.isArray(question.rightcol)) {
      throw new ClientException('Incorrect Question Property Type!');
    }
  }
  if (question.type === 'fill in the blanks') {
    if (!Array.isArray(question.context) || !Array.isArray(question.answer)
      || !Array.isArray(question.options)) {
      throw new ClientException('Incorrect Question Property Type!');
    }
    question.options.forEach((value) => {
      if (!Array.isArray(value)) {
        throw new ClientException('Incorrect Question Property Type!');
      }
    });
  }
}

module.exports = { validateQuestion };
