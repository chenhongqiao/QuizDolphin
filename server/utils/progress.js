class ProgressUtils {
  static getInitialProgress(question) {
    const responses = [];
    const types = [];
    for (let index = 0; index < question.length; index += 1) {
      if (question[index].type === 'single choice' || question[index].type === 'short response') {
        responses[index] = '';
      } else if (question[index].type === 'multiple choice' || question[index].type === 'matching' || question[index].type === 'fill in the blanks') {
        responses[index] = [];
      }
      types[index] = question[index].type;
    }
    return { responses, types };
  }
}

module.exports = ProgressUtils;
