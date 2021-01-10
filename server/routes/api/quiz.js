const express = require('express');
const { promisify } = require('util');

const router = express.Router();

const dbService = require('../../modules/dbService');
const redis = require('../../modules/redisService');
const gradingService = require('../../modules/gradingService');

function QuizConstructor(quizName, quizId, questionCount, duration) {
  this.quizName = quizName;
  this.quizId = quizId;
  this.questionCount = questionCount;
  this.duration = duration;
}

function ClientException(message) {
  this.message = message;
  this.type = 'ClientException';
}

function HistoryRecordConstructor(email, oldHistory, newRecord) {
  this.email = email;
  if (oldHistory) {
    this.history = oldHistory.history;
    this.bestScore = Math.max(oldHistory.bestScore, newRecord.score);
  } else {
    this.history = [];
    this.bestScore = newRecord.score;
  }
  this.history.push(newRecord);
}

function QuizDataConstructor(email, questions, duration) {
  this.email = email;
  this.endTime = Math.floor(Date.now() / 1000) + duration;
  this.question = questions;
}

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

router.get('/questions', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const quizId = parseInt(req.query.quizId, 10);
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }

    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const quizCollection = await dbService.loadCollection('quiz');
    const allQuestions = await questionsCollection.find({}).toArray();
    const allQuestionCount = allQuestions.length;
    const userQuestions = [];
    const existedIndexs = new Set();
    const quizInfo = await quizCollection.findOne({ quizId });
    const { questionCount } = quizInfo;

    if (!questionCount || questionCount > allQuestionCount) {
      throw new ClientException('Invalid Question Count!');
    }

    while (userQuestions.length < questionCount) {
      const index = getRandomInteger(0, allQuestionCount);
      if (!existedIndexs.has(index)) {
        userQuestions.push(allQuestions[index]);
        existedIndexs.add(index);
      }
    }

    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    if (await onGoingCollection.findOne({ email: req.session.email })) {
      throw new ClientException('Unfinished Quiz Detected!');
    }
    const quizData = new QuizDataConstructor(req.session.email, userQuestions, quizInfo.duration);
    await onGoingCollection.insertOne(quizData);

    res.send(quizData);
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

router.get('/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const historyCollection = await dbService.loadCollection(`quiz${quizId}-history`);
    const userHistory = await historyCollection.findOne({ email: req.session.email });
    if (userHistory === null) {
      res.send('No History!');
    } else {
      res.send(userHistory.history);
    }
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

router.get('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const onGoingData = await onGoingCollection.findOne({ email: req.session.email });
    if (onGoingData) {
      res.send(onGoingData);
    } else {
      res.send('No Ongoing Quiz!');
    }
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

router.get('/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const redisGet = promisify(redis.get).bind(redis);
    const redisKey = `progress:quiz${quizId}-${req.session.email}`;
    res.send(JSON.parse((await redisGet(redisKey))));
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

router.post('/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.body.data;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const redisGet = promisify(redis.get).bind(redis);
    const redisSet = promisify(redis.set).bind(redis);
    const redisKey = `progress:quiz${quizId}-${req.session.email}`;
    const current = JSON.parse((await redisGet(redisKey)));
    if (!current || current.version < req.body.data.quizProgress.version) {
      await redisSet(redisKey, JSON.stringify(req.body.data.quizProgress));
      res.send('Success!');
    } else {
      res.send('Refuse to overwrite!');
    }
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

router.post('/submission', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.body.data;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const onGoingData = (await onGoingCollection.findOne({ email: req.session.email }));
    const { endTime } = onGoingData;
    if (Math.floor(Date.now() / 1000) > endTime) {
      res.send('Late submission, Refuse to grade');
      return;
    }
    const redisGet = promisify(redis.get).bind(redis);
    const userAnswer = JSON.parse(await redisGet(`progress:quiz${quizId}-${req.session.email}`)).attempt;
    const quizResult = await gradingService.gradeQuiz(
      quizId,
      onGoingData.question,
      userAnswer,
    );
    const historyCollection = await dbService.loadCollection(`quiz${quizId}-history`);
    const oldHistory = await historyCollection.findOne({ email: req.session.email });
    const newHistory = new HistoryRecordConstructor(req.session.email, oldHistory, quizResult);
    await historyCollection.replaceOne({ email: req.session.email }, newHistory, { upsert: true });
    await onGoingCollection.deleteOne({ email: req.session.email });
    const redisDelete = promisify(redis.del).bind(redis);
    await redisDelete(`progress:quiz${quizId}-${req.session.email}`);
    res.send(quizResult);
  } catch (err) {
    if (err.type === 'ClientException') {
      res.status(400).send(err.message);
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.get('/list', async (req, res, next) => {
  try {
    const quizCollection = await dbService.loadCollection('quiz');
    const allQuiz = await quizCollection.find({}).toArray();
    res.send(allQuiz);
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    throw new ClientException('Unauthorized!');
  }
  try {
    const quizCollection = await dbService.loadCollection('quiz');
    const quizId = await quizCollection.countDocuments() + 1;
    quizCollection.insertOne(new QuizConstructor(req.body.data.quizName, quizId,
      req.body.data.questionCount, req.body.data.duration));
    res.send('Sucess!');
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
