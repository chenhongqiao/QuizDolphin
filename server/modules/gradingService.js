const { DateTime } = require('luxon');

const dbService = require('./dbService');

function QuizResultConstructor(score, questions, results, totalPoints) {
  this.score = score;
  this.totalPoints = totalPoints;
  this.timeStamp = DateTime.local().toUTC().toISO();
  this.questions = questions;
  this.results = results;
}

function QuestionResultConstructor(response, answer, score, questionId, points) {
  this.questionId = questionId;
  this.response = response;
  this.answer = answer;
  this.points = points;
  this.score = score;
}

async function gradeQuiz(quizId, questions, responses) {
  const results = [];
  const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
  const answersPromise = [];
  for (let index = 0; index < questions.length; index += 1) {
    answersPromise[index] = answersCollection.findOne({ questionId: questions[index].questionId });
  }
  const answers = await Promise.all(answersPromise);
  let totalPoints = 0;
  let score = 0;
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const response = responses[index];
    const { answer } = answers[index];
    totalPoints += question.points;
    // Grade single choice and short response questions
    if (question.type === 'single choice' || question.type === 'short response') {
      // Gain full points only if user's input match exactly with correct answer
      if (answer === response) {
        results.push(new QuestionResultConstructor(
          response, answer, question.points,
          question.questionId, question.points,
        ));
        score += question.points;
      } else {
        results.push(new QuestionResultConstructor(
          response, answer, 0, question.questionId, question.points,
        ));
      }
    }

    // Grade multiple choice questions
    if (question.type === 'multiple choice') {
      const answersSet = new Set(answer);
      // Points are proportional to how many correction opions are chosen.
      // Additionally, user get 0 for the entire question if incorrect options are chosen.
      const correctCount = response.reduce((count, option) => {
        if (answersSet.has(option)) {
          return count + 1;
        }
        return -Infinity;
      }, 0);
      if (correctCount < 0) {
        results.push(new QuestionResultConstructor(
          response, answer, 0, question.questionId, question.points,
        ));
      } else {
        results.push(new QuestionResultConstructor(
          response, answer,
          question.points * (correctCount / answersSet.size),
          question.questionId, question.points,
        ));
        score += question.points * (correctCount / answersSet.size);
      }
    }

    if (question.type === 'matching') {
      const correctMatch = response.reduce((count, option, optionIndex) => {
        if (option === answer[optionIndex]) {
          return count + 1;
        }
        return count;
      }, 0);
      results.push(new QuestionResultConstructor(
        response, answer,
        question.points * (correctMatch / answer.length),
        question.questionId, question.points,
      ));
      score += question.points * (correctMatch / answer.length);
    }

    if (question.type === 'fill in the blanks') {
      const correctMatch = response.reduce((count, option, optionIndex) => {
        if (option === answer[optionIndex]) {
          return count + 1;
        }
        return count;
      }, 0);
      results.push(new QuestionResultConstructor(
        response, answer,
        question.points * (correctMatch / answer.length),
        question.questionId, question.points,
      ));
      score += question.points * (correctMatch / answer.length);
    }
  }
  const quizResult = new QuizResultConstructor(score, questions,
    results, totalPoints);
  return quizResult;
}

module.exports = { gradeQuiz };
