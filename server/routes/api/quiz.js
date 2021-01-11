const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');
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

function QuizDataConstructor(email, questions, duration, attemptId) {
  this.email = email;
  this.endTime = Math.floor(Date.now() / 1000) + duration;
  this.questions = questions;
  this.attemptId = attemptId;
}

function ProgressConstructor(version, attempt, attemptId) {
  this.version = version;
  this.attempt = attempt;
  this.attemptId = attemptId;
  this.index = 1;
}

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function getInitialAttempt(quizData) {
  const initialAttempt = [];
  quizData.forEach((question, index) => {
    if (question.type === 'single choice' || question.type === 'short response') {
      initialAttempt[index] = '';
    } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
      initialAttempt[index] = [];
    }
  });
  return initialAttempt;
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
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const previousQuizData = await onGoingCollection.findOne({ email: req.session.email });
    if (previousQuizData) {
      if (!await redisService.get(`progress:${quizId}-${req.session.email}-${previousQuizData.attemptId}`)) {
        const initialAttempt = getInitialAttempt(previousQuizData.questions);
        const initialProgress = new ProgressConstructor(1,
          initialAttempt, previousQuizData.attemptId);
        await redisService.set(`progress:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(initialProgress));
        await redisService.setnx(`endTime:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(previousQuizData.endTime));
      }
      res.send(previousQuizData);
      return;
    }
    if (req.query.newQuiz === 'true') {
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
      const attemptId = uuidv4();
      const quizData = new QuizDataConstructor(req.session.email, userQuestions,
        quizInfo.duration, attemptId);
      const initialAttempt = getInitialAttempt(quizData.questions);
      const initialProgress = new ProgressConstructor(1, initialAttempt, attemptId);
      await onGoingCollection.insertOne(quizData);
      await redisService.set(`progress:${quizId}-${req.session.email}-${attemptId}`, JSON.stringify(initialProgress));
      await redisService.setnx(`endTime:${quizId}-${req.session.email}-${attemptId}`, JSON.stringify(quizData.endTime));
      res.send(quizData);
    } else {
      res.send('No Ongoing Questions!');
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
    const userHistory = await historyCollection.find({
      $query: { email: req.session.email },
      $orderby: { timeStamp: 1 },
    }).toArray();
    if (!Array.isArray(userHistory) || userHistory.length === 0) {
      res.send('No History!');
    } else {
      res.send(userHistory);
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
    const { attemptId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    res.send(JSON.parse((await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`))));
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
    const { attemptId } = req.body.data.quizProgress;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const endTime = await redisService.get(`endTime:${quizId}-${req.session.email}-${attemptId}`);
    if (!endTime) {
      const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
      const previousQuizData = await onGoingCollection.findOne({ email: req.session.email });
      await redisService.setnx(`endTime:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(previousQuizData.endTime));
    }
    if (Math.floor(Date.now() / 1000) <= endTime) {
      const current = JSON.parse((await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`)));
      if (!current || current.version < req.body.data.quizProgress.version) {
        await redisService.set(`progress:${quizId}-${req.session.email}-${attemptId}`, JSON.stringify(req.body.data.quizProgress));
        res.send('Success!');
      } else {
        res.send('Refuse to overwrite!');
      }
    } else {
      res.send('Quiz Ended!');
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

router.get('/result', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.send('Not Logged In!');
      return;
    }
    const quizId = parseInt(req.query.quizId, 10);
    const { attemptId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const onGoingData = (await onGoingCollection.findOne({ email: req.session.email }));
    const historyCollection = await dbService.loadCollection(`quiz${quizId}-history`);
    const userAnswer = JSON.parse(await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`)).attempt;
    if (!userAnswer || !onGoingData || onGoingData.attemptId !== attemptId) {
      res.send(await historyCollection.findOne({ attemptId }));
      return;
    }
    const quizResult = await gradingService.gradeQuiz(
      quizId,
      onGoingData.questions,
      userAnswer,
    );
    quizResult.attemptId = attemptId;
    quizResult.email = req.session.email;
    await historyCollection.insertOne(quizResult);
    await onGoingCollection.deleteOne({ email: req.session.email });
    await redisService.del(`progress:${quizId}-${req.session.email}-${attemptId}`);
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
