const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const validation = require('../../modules/dataValidation');
const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');

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

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

router.get('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const questionsCollection = await dbService.loadCollection('questions');
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

    const redis = redisService.loadDatabase(0);
    const redisSet = promisify(redis.set).bind(redis);
    const redisGet = promisify(redis.get).bind(redis);
    if ((await redisGet(req.session.email))) {
      throw new UserException('Unfinished Quiz Detected!');
    }
    await redisSet(req.session.email, JSON.stringify(userQuestions));
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
    const questionsCollection = await dbService.loadCollection('questions');
    const answersCollection = await dbService.loadCollection('answers');
    const questionId = uuidv4();
    validation.validateQuestion(req.body.data);
    const newQuestion = new QuestionConstructor(req.body.data, questionId);
    const newAnswer = new AnswerConstructor(req.body.data, questionId);
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
