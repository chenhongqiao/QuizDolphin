function validateQuestion(question) {
  if (!question.context || !question.type || !question.points
    || !question.answer || !question.quizId) {
    return false;
  }

  if (question.type !== 'single choice' && question.type !== 'multiple choice' && question.type !== 'short response'
    && question.type !== 'matching' && question.type !== 'fill in the blanks') {
    return false;
  }

  if (question.type === 'single choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || typeof question.answer !== 'string') {
      return false;
    }
    let includeAnswer = false;
    for (let index = 0; index < question.options.length; index += 1) {
      if (typeof question.options[index] !== 'string') {
        return false;
      }
      if (question.answer === question.options[index]) {
        includeAnswer = true;
      }
    }
    if (!includeAnswer) {
      return false;
    }
  } else if (question.type === 'multiple choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || !Array.isArray(question.answer)) {
      return false;
    }
    for (let index = 0; index < question.answer; index += 1) {
      if (typeof question.answer[index] !== 'string') {
        return false;
      }
    }
    const answerSet = new Set(question.answer);
    for (let index = 0; index < question.options.length; index += 1) {
      if (typeof question.options[index] !== 'string') {
        return false;
      }
      if (answerSet.has(question.options[index])) {
        answerSet.delete(question.options[index]);
      }
    }
    if (answerSet.size !== 0) {
      return false;
    }
  } else if (question.type === 'short response') {
    if (typeof question.context !== 'string' || typeof question.answer !== 'string') {
      return false;
    }
  } else if (question.type === 'matching') {
    if (typeof question.context !== 'string' || !Array.isArray(question.answer)
      || !Array.isArray(question.leftcol) || !Array.isArray(question.rightcol)) {
      return false;
    }
    if (question.leftcol.length !== question.rightcol.length
      || question.answer.length !== question.rightcol.length) {
      return false;
    }
    const answerSet = new Set(question.answer);
    for (let index = 0; index < question.rightcol.length; index += 1) {
      if (typeof question.rightcol[index] !== 'string') {
        return false;
      }
      if (typeof question.leftcol[index] !== 'string') {
        return false;
      }
      if (typeof question.answer[index] !== 'string') {
        return false;
      }
      if (answerSet.has(question.rightcol[index])) {
        answerSet.delete(question.rightcol[index]);
      }
    }
  } else if (question.type === 'fill in the blanks') {
    if (!Array.isArray(question.context) || !Array.isArray(question.answer)
      || !Array.isArray(question.options)) {
      return false;
    }
    if (question.context.length !== question.options.length + 1
      || question.options.length !== question.answer.length) {
      return false;
    }
    for (let index = 0; index < question.context.length; index += 1) {
      if (typeof question.context[index] !== 'string') {
        return false;
      }
    }
    for (let index = 0; index < question.options.length; index += 1) {
      if (typeof question.answer[index] !== 'string' || !Array.isArray(question.options[index])) {
        return false;
      }
      let includeAnswer = false;
      for (let lindex = 0; lindex < question.options[index].length; lindex += 1) {
        if (question.options[index][lindex] !== 'string') {
          return false;
        }
        if (question.options[index][lindex] === question.answer[index]) {
          includeAnswer = true;
        }
      }
      if (!includeAnswer) {
        return false;
      }
    }
  }
  return true;
}

module.exports = { validateQuestion };
