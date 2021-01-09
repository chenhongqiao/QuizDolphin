const express = require('express');
const { promisify } = require('util');
const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');
const gradingService = require('../../modules/gradingService');

const router = express.Router();

function HistoryRecordConstructor(email, oldhistory, newrecord) {
  this.email = email;
  if (oldhistory) {
    this.history = oldhistory.history;
  } else {
    this.history = [];
  }
  this.history.push(newrecord);
}

function ClientException(message) {
  this.message = message;
  this.type = 'ClientException';
}

router.post('/', async (req, res, next) => {
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
      req.send('Late submission, Refuse to grade');
      return;
    }
    if (!req.body.data.answers || !Array.isArray(req.body.data.answers)) {
      throw new ClientException('Invalid Answers Array!');
    }
    const quizResult = await gradingService.gradeQuiz(
      quizId,
      onGoingData.question, req.body.data.answers,
    );
    const historyCollection = await dbService.loadCollection(`quiz${quizId}-history`);
    const oldHistory = await historyCollection.findOne({ email: req.session.email });
    const newHistory = new HistoryRecordConstructor(req.session.email, oldHistory, quizResult);
    await historyCollection.replaceOne({ email: req.session.email }, newHistory, { upsert: true });
    await onGoingCollection.deleteOne({ email: req.session.email });
    const redis = redisService.loadDatabase(1);
    const redisDelete = promisify(redis.del).bind(redis);
    await redisDelete(`quiz${quizId}-${req.session.email}`);
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

module.exports = router;
