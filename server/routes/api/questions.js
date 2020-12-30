const express = require('express');
const mongodb = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

function QuestionConstructor(question, uuid) {
  this.uuid = uuid;
  this.context = question.context;
  this.points = question.points;
  this.type = question.type;
  if (question.type === 'single choice' || question.type === 'multiple choice') {
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

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

function verifyQuestion(question) {
  if (question.context === undefined || question.type === undefined
    || question.points === undefined || question.answer === undefined) {
    throw new UserException('Missing Question Property!');
  }
  if (question.uuid !== undefined) {
    throw new UserException('Request Should Not Specify UUID!');
  }
  if (question.type !== 'single choice' && question.type !== 'multiple choice' && question.type !== 'short response' && question.type !== 'matching') {
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
    if (typeof question.context !== 'string' || !Array.isArray(question.answer) || !Array.isArray(question.leftcol) || !Array.isArray(question.rightcol)) {
      throw new UserException('Incorrect Question Property Type!');
    }
  }
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

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

router.get('/', async (req, res, next) => {
  try {
    const questionsCollection = await loadQuestionsCollection().catch();
    const allQuestions = await questionsCollection.find({}).toArray();
    const allQuestionCount = allQuestions.length;
    const userQuestions = [];
    const existedIndexs = new Set();

    if (req.query.count === undefined || req.query.count > allQuestionCount) {
      throw new UserException('Invalid Question Count!');
    }

    while (userQuestions.length < req.query.count) {
      const index = getRandomInteger(0, allQuestionCount);
      if (!existedIndexs.has(index)) {
        userQuestions.push(allQuestions[index]);
        existedIndexs.add(index);
      }
    }
    res.send(userQuestions);
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'UserException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

/*
TODO:
- Authenication
- Duplicated uuid handle
*/
router.post('/', async (req, res, next) => {
  try {
    const questionsCollection = await loadQuestionsCollection();
    const answersCollection = await loadAnswersCollection();
    const questionId = uuidv4();
    verifyQuestion(req.body);
    const newQuestion = new QuestionConstructor(req.body, questionId);
    const newAnswer = new AnswerConstructor(req.body, questionId);
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'UserException') {
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
