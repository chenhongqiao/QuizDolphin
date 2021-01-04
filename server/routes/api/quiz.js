const express = require('express');
const { promisify } = require('util');

const router = express.Router();

const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');

function QuizConstructor(quizName, quizId) {
  this.quizName = quizName;
  this.quizId = quizId;
}

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

router.get('/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new UserException('Invalid QuizID!');
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

router.get('/ongoingquestion', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new UserException('Invalid QuizID!');
    }
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const onGoingQuestion = await onGoingCollection.findOne({ email: req.session.email });
    if (onGoingQuestion) {
      res.send(onGoingQuestion);
    } else {
      res.send('No Ongoing Quiz!');
    }
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

router.get('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new UserException('Invalid QuizID!');
    }
    const redis = redisService.loadDatabase(1);
    const redisGet = promisify(redis.get).bind(redis);
    const redisKey = `quiz${quizId}-${req.session.email}`;
    res.send(JSON.parse((await redisGet(redisKey))));
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

router.post('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.body.data;
    if (!quizId) {
      throw new UserException('Invalid QuizID!');
    }
    const redis = redisService.loadDatabase(1);
    const redisGet = promisify(redis.get).bind(redis);
    const redisSet = promisify(redis.set).bind(redis);
    const current = JSON.parse((await redisGet(req.session.email)));
    const redisKey = `quiz${quizId}-${req.session.email}`;
    if (!current || current.version < req.body.data.quizProgress.version) {
      await redisSet(redisKey, JSON.stringify(req.body.data.quizProgress));
      res.send('Success!');
    } else {
      res.send('Refuse to overwrite newer version with older one!');
    }
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

router.post('/', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    throw new UserException('Unauthorized!');
  }
  try {
    const quizCollection = await dbService.loadCollection('quiz');
    const quizId = await quizCollection.countDocuments() + 1;
    quizCollection.insertOne(new QuizConstructor(req.body.data.quizName, quizId));
    res.send('Sucess!');
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const quizCollection = await dbService.loadCollection('quiz');
    const allQuiz = await quizCollection.find({}).toArray();
    res.send(allQuiz);
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
