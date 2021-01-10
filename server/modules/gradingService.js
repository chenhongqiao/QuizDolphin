const { DateTime } = require('luxon');

const dbService = require('./dbService');

function QuizResultConstructor(score, questions, results, totalPoints) {
  this.score = score;
  this.totalPoints = totalPoints;
  this.timeStamp = DateTime.local().toUTC().toISO();
  this.questions = questions;
  this.questionsResult = results;
}

function QuestionResultConstructor(userAnswer, correctAnswer, score, uuid, points) {
  this.uuid = uuid;
  this.userAnswer = userAnswer;
  this.correctAnswer = correctAnswer;
  this.points = points;
  this.score = score;
}
function ClientException(message) {
  this.message = message;
  this.type = 'ClientException';
}
async function gradeQuiz(quizId, questionsArray, answersArray) {
  let totalPoints = 0;
  const resultsArray = [];
  const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
  const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
  const score = answersArray.reduce(async (accumulator, current, index) => {
    console.log(current);
    const questionUuid = questionsArray[index].uuid;
    const correctAnswer = await answersCollection.findOne({ uuid: questionUuid });
    const question = await questionsCollection.findOne({ uuid: questionUuid });

    if (!correctAnswer || !question) {
      throw new ClientException('Invalid UUID!');
    }

    // Grade single choice and short response questions
    if (question.type === 'single choice' || question.type === 'short response') {
      if (typeof current !== 'string') {
        throw new ClientException('Incorrect Answer Type!');
      }
      totalPoints += question.points;
      // Gain full points only if user's input match exactly with correct answer
      if (correctAnswer.answer === current) {
        resultsArray.push(new QuestionResultConstructor(
          current, correctAnswer.answer, question.points,
          questionUuid, question.points,
        ));
        return (await accumulator) + question.points;
      }
      resultsArray.push(new QuestionResultConstructor(
        current, correctAnswer.answer, 0, questionUuid, question.points,
      ));
      return accumulator;
    }

    // Grade multiple choice questions
    if (question.type === 'multiple choice') {
      const answersSet = new Set(correctAnswer.answer);
      if (!Array.isArray(current)) {
        throw new ClientException('Incorrect Answer Type!');
      }
      totalPoints += question.points;
      // Points are proportional to how many correction opions are chosen.
      // Additionally, user get 0 for the entire question if incorrect options are chosen.
      const correctCount = current.reduce((countAccumulator, currentOption) => {
        if (answersSet.has(currentOption)) {
          return countAccumulator + 1;
        }
        return -Infinity;
      }, 0);
      if (correctCount < 0) {
        resultsArray.push(new QuestionResultConstructor(
          current, correctAnswer.answer, 0, questionUuid, question.points,
        ));
        return accumulator;
      }
      resultsArray.push(new QuestionResultConstructor(
        current, correctAnswer.answer,
        question.points * (correctCount / answersSet.size),
        questionUuid, question.points,
      ));
      return (await accumulator) + question.points * (correctCount / answersSet.size);
    }

    if (question.type === 'matching') {
      if (!Array.isArray(current)) {
        throw new ClientException('Incorrect Answer Type!');
      }
      totalPoints += question.points;
      const correctMatch = current.reduce((countAccumulator, currentRightCol, cindex) => {
        if (currentRightCol === correctAnswer.answer[cindex]) {
          return countAccumulator + 1;
        }
        return countAccumulator;
      }, 0);
      resultsArray.push(new QuestionResultConstructor(
        current, correctAnswer.answer,
        question.points * (correctMatch / correctAnswer.answer.length),
        questionUuid, question.points,
      ));
      return (await accumulator)
        + question.points * (correctMatch / correctAnswer.answer.length);
    }

    if (question.type === 'fill in the blanks') {
      if (!Array.isArray(current)) {
        throw new ClientException('Incorrect Answer Type!');
      }
      totalPoints += question.points;
      const correctMatch = current.reduce((countAccumulator, currentRightCol, cindex) => {
        if (currentRightCol === correctAnswer.answer[cindex]) {
          return countAccumulator + 1;
        }
        return countAccumulator;
      }, 0);
      resultsArray.push(new QuestionResultConstructor(
        current, correctAnswer.answer,
        question.points * (correctMatch / correctAnswer.answer.length),
        questionUuid, question.points,
      ));
      return (await accumulator)
        + question.points * (correctMatch / correctAnswer.answer.length);
    }

    return accumulator;
  }, Promise.resolve(0));
  const quizResult = new QuizResultConstructor(await score, questionsArray,
    resultsArray, totalPoints);
  return quizResult;
}

module.exports = { gradeQuiz };
