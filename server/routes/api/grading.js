const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

function QuizResultConstructor(score, questions, results) {
  this.score = score;
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

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
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

router.post('/', async (req, res, next) => {
  try {
    const answersCollection = await loadAnswersCollection();
    const questionsCollection = await loadQuestionsCollection();
    const questionsArray = [];
    const resultsArray = [];
    if (req.body.answers === undefined || !Array.isArray(req.body.answers)) {
      throw new UserException('Invalid Answers Array!');
    }
    const score = req.body.answers.reduce(async (accumulator, current) => {
      if (current.uuid === undefined || current.answer === undefined) {
        throw new UserException('Missing Answer Property!');
      }

      const questionUuid = current.uuid;
      const correctAnswers = await answersCollection.find({ uuid: questionUuid }).toArray();
      const questions = await questionsCollection.find({ uuid: questionUuid }).toArray();

      if (correctAnswers.length < 1 || questions.length < 1) {
        throw new UserException('Invalid UUID!');
      }
      if (correctAnswers.length > 1 || questions.length > 1) {
        throw new Error('Duplicated UUID!');
      }

      // Grade single choice and short response questions
      if (questions[0].type === 'single choice' || questions[0].type === 'short response') {
        questionsArray.push(questions[0]);
        if (typeof current.answer !== 'string') {
          throw new UserException('Incorrect Answer Type!');
        }

        // Gain full points only if user's input match exactly with correct answer
        if (correctAnswers[0].answer === current.answer) {
          resultsArray.push(new QuestionResultConstructor(
            current.answer, correctAnswers[0].answer, questions[0].points,
            questionUuid, questions[0].points,
          ));
          return (await accumulator) + questions[0].points;
        }
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswers[0].answer, 0, questionUuid, questions[0].points,
        ));
        return accumulator;
      }

      // Grade multiple choice questions
      if (questions[0].type === 'multiple choice') {
        questionsArray.push(questions[0]);
        const answersSet = new Set(correctAnswers[0].answer);
        if (!Array.isArray(current.answer)) {
          throw new UserException('Incorrect Answer Type!');
        }

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
            current.answer, correctAnswers[0].answer, 0, questionUuid, questions[0].points,
          ));
          return accumulator;
        }
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswers[0].answer,
          questions[0].points * (correctCount / answersSet.size),
          questionUuid, questions[0].points,
        ));
        return (await accumulator) + questions[0].points * (correctCount / answersSet.size);
      }

      if (questions[0].type === 'matching') {
        if (!Array.isArray(current.answer)) {
          throw new UserException('Incorrect Answer Type!');
        }

        questionsArray.push(questions[0]);
        const correctMatch = current.answer.reduce((countAccumulator, currentRightCol, index) => {
          if (currentRightCol === correctAnswers[0].answer[index]) {
            return countAccumulator + 1;
          }
          return countAccumulator;
        }, 0);
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswers[0].answer,
          questions[0].points * (correctMatch / correctAnswers[0].answer.length),
          questionUuid, questions[0].points,
        ));
        return (await accumulator)
        + questions[0].points * (correctMatch / correctAnswers[0].answer.length);
      }

      return accumulator;
    }, Promise.resolve(0));
    const quizResult = new QuizResultConstructor(await score, questionsArray, resultsArray);
    res.send(quizResult);
  } catch (err) {
    if (err.type === 'UserException') {
      res.status(400).send(err.message);
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

module.exports = router;
