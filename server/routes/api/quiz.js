const express = require('express');
const { promisify } = require('util');

const router = express.Router();

const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');

function QuizConstructor(quizName, quizId){
  this.quizName = quizName;
  this.quizId = quizId;
}

router.get('/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    const historyCollection = await dbService.loadCollection(`${quizId}-history`);
    const userHistory = await historyCollection.findOne({ email: req.session.email });
    if (userHistory === null) {
      res.send('No History!');
    } else {
      res.send(userHistory.history);
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.get('/ongoingquestion', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    const onGoingCollection = await dbService.loadCollection(`${quizId}-ongoing`);
    const onGoingQuestion = await onGoingCollection.findOne({ email: req.session.email });
    if (onGoingQuestion) {
      res.send(onGoingQuestion);
    } else {
      res.send('No Ongoing Quiz!');
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.get('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    const redis = redisService.loadDatabase(0);
    const redisGet = promisify(redis.get).bind(redis);
    res.send(JSON.parse((await redisGet(`${quizId}-${req.session.email}`))));
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.post('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.query;
    const redis = redisService.loadDatabase(0);
    const redisGet = promisify(redis.get).bind(redis);
    const redisSet = promisify(redis.set).bind(redis);
    const current = JSON.parse((await redisGet(req.session.email)));
    if (!current || current.version < req.body.data.version) {
      await redisSet(`${quizId}-${req.session.email}`, JSON.stringify(req.body.data));
      res.send('Success!');
    } else {
      res.send('Refuse to overwrite newer version with older one!');
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.post('/new', async (req, res, next) => {
  try {
    const quizCollection = await dbService.loadCollection('quiz');
    const quizId = await quizCollection.countDocuments() + 1;
    quizCollection.insertOne(new QuizConstructor(req.body.data.quizName,quizId));
    res.send('Sucess!');
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
