const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validation = require('../../modules/dataValidation');
const dbService = require('../../modules/dbService');

const router = express.Router();

function QuestionConstructor(question, uuid) {
  this.uuid = uuid;
  this.context = question.context;
  this.points = question.points;
  this.type = question.type;
  if (question.type === 'single choice' || question.type === 'multiple choice' || question.type === 'fill in the blanks') {
    this.options = question.options;
  }
  if (question.type === 'matching') {
    this.rightcol = question.rightcol;
    this.leftcol = question.leftcol;
  }
}

function AnswerConstructor(question, uuid) {
  this.uuid = uuid;
  this.answer = question.answer;
}

function AllQuestionsListConstructor(questions, answers) {
  this.questions = questions;
  this.answers = answers;
}

function ClientException(message) {
  this.message = message;
  this.type = 'ClientException';
}

/*
TODO:
- Duplicated uuid handle
*/

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new ClientException('Unauthorized!');
    }
    const { quizId } = req.body.data;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
    const questionId = uuidv4();
    validation.validateQuestion(req.body.data);
    const newQuestion = new QuestionConstructor(req.body.data, questionId);
    const newAnswer = new AnswerConstructor(req.body.data, questionId);
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'ClientException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new ClientException('Unauthorized!');
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
    const allQuestions = await questionsCollection.find({}).toArray();
    const allAnswers = await answersCollection.find({}).toArray();
    res.send(new AllQuestionsListConstructor(allQuestions, allAnswers));
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'ClientException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.delete('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new ClientException('Unauthorized!');
    }
    const { quizId } = req.query;
    const { uuid } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    if (!uuid) {
      throw new ClientException('Invalid UUID!');
    }
    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
    await questionsCollection.deleteOne({ uuid });
    await answersCollection.deleteOne({ uuid });
    res.send('Success!');
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'ClientException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.put('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new ClientException('Unauthorized!');
    }
    const { quizId } = req.body.data;
    const { uuid } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    if (!uuid) {
      throw new ClientException('Invalid UUID!');
    }
    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
    await questionsCollection.deleteOne({ uuid });
    await answersCollection.deleteOne({ uuid });
    const newQuestion = new QuestionConstructor(req.body.data, uuid);
    const newAnswer = new AnswerConstructor(req.body.data, uuid);
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'ClientException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

module.exports = router;
