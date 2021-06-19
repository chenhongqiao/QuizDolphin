const validateUtils = require('../utils/validateUtil');

function Thread(email, question, answer, threadId) {
  if (validateUtils.validateHelp(email, question, answer, threadId)) {
    this.email = email;
    this.question = question;
    this.answer = answer;
    this.helpId = threadId;
  } else {
    this.invalid = true; // Special: if this question's syntax passed validation
  }
}

module.exports = { Thread };
