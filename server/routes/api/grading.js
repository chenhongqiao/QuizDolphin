const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

function QuizResultConstructor(score, questions, results) {
  this.score = score;
  this.questions = questions;
  this.questionsResult = results;
}

function QuestionResultConstructor(userAnswer, correctAnswer, score, uuid) {
  this.uuid = uuid;
  this.userAnswer = userAnswer;
  this.correctAnswer = correctAnswer;
  this.score = score;
}

async function loadQuestionsCollection() {
  const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client.db('server').collection('questions');
}

async function loadAnswersCollection() {
  const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client.db('server').collection('answers');
}

router.post('/', async (req, res) => {
  const answersCollection = await loadAnswersCollection();
  const questionsCollection = await loadQuestionsCollection();
  const questionsArray = [];
  const resultsArray = [];
  const score = req.body.answers.reduce(async (accumulator, current) => {
    const questionUuid = current.uuid;
    const correctAnswers = await answersCollection.find({ uuid: questionUuid }).toArray();
    const questions = await questionsCollection.find({ uuid: questionUuid }).toArray();
    // Grade single choice and short response questions
    if (questions[0].type === 'single choice' || questions[0].type === 'short response') {
      questionsArray.push(questions[0]);
      // Gain full points only if user's input match exactly with correct answer
      if (correctAnswers[0].answer === current.answer) {
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswers[0].answer, questions[0].points, questionUuid,
        ));
        return (await accumulator) + questions[0].points;
      }
      resultsArray.push(new QuestionResultConstructor(
        current.answer, correctAnswers[0].answer, 0, questionUuid,
      ));
      return accumulator;
    }

    // Grade multiple choice questions
    if (questions[0].type === 'multiple choice') {
      questionsArray.push(questions[0]);
      const answersSet = new Set(correctAnswers[0].answer);
      // Points are proportional to how many correction opions are chosen.
      // Additionally, user get 0 for the entire question if incorrect options are chosen.
      const correctCount = current.answer.reduce((countAccumulator, currentOption) => {
        if (answersSet.has(currentOption)) {
          return countAccumulator + 1;
        }
        return -Infinity;
      }, 0);
      if (correctCount < 0) {
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswers[0].answer, 0, questionUuid,
        ));
        return accumulator;
      }
      resultsArray.push(new QuestionResultConstructor(
        current.answer, correctAnswers[0].answer,
        questions[0].points * (correctCount / answersSet.size),
        questionUuid,
      ));
      return (await accumulator) + questions[0].points * (correctCount / answersSet.size);
    }
    return accumulator;
  }, Promise.resolve(0));
  const quizResult = new QuizResultConstructor(await score, questionsArray, resultsArray);
  console.log(quizResult);
  res.send(quizResult);
});

module.exports = router;
