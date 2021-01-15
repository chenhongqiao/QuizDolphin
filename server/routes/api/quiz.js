const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid16 = customAlphabet(alphabet, 16);

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

function ProgressConstructor(version, responses, attemptId) {
  this.version = version;
  this.responses = responses;
  this.attemptId = attemptId;
  this.index = 1;
}

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function getInitialResponses(quizData) {
  const initialResponses = [];
  quizData.forEach((question, index) => {
    if (question.type === 'single choice' || question.type === 'short response') {
      initialResponses[index] = '';
    } else if (question.type === 'multiple choice' || question.type === 'matching' || question.type === 'fill in the blanks') {
      initialResponses[index] = [];
    }
  });
  return initialResponses;
}
router.get('/:quizId/questions', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const attemptsCollection = await dbService.loadCollection(`${quizId}-attempts`);
    const previousQuizData = await attemptsCollection.findOne({ email: req.session.email });
    if (previousQuizData) {
      if (!await redisService.get(`progress:${quizId}-${req.session.email}-${previousQuizData.attemptId}`)) {
        const initialResponses = getInitialResponses(previousQuizData.questions);
        const initialProgress = new ProgressConstructor(1,
          initialResponses, previousQuizData.attemptId);
        await redisService.set(`progress:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(initialProgress));
        await redisService.setnx(`endTime:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(previousQuizData.endTime));
      }
      res.send(previousQuizData);
      return;
    }
    if (req.query.newQuiz === 'true') {
      const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
      const quizCollection = await dbService.loadCollection('quizzes');
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
      const initialResponses = getInitialResponses(quizData.questions);
      const initialProgress = new ProgressConstructor(1, initialResponses, attemptId);
      await attemptsCollection.insertOne(quizData);
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

router.get('/:quizId/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const resultsCollection = await dbService.loadCollection(`${quizId}-results`);
    const userHistory = await resultsCollection.find({
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

router.get('/:quizId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
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

router.post('/:quizId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { attemptId } = req.body.data.progress;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const endTime = await redisService.get(`endTime:${quizId}-${req.session.email}-${attemptId}`);
    if (!endTime) {
      const attemptsCollection = await dbService.loadCollection(`${quizId}-attempts`);
      const previousQuizData = await attemptsCollection.findOne({ email: req.session.email });
      await redisService.setnx(`endTime:${quizId}-${req.session.email}-${previousQuizData.attemptId}`, JSON.stringify(previousQuizData.endTime));
    }
    if (Math.floor(Date.now() / 1000) <= endTime) {
      const current = JSON.parse((await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`)));
      if (!current || current.version < req.body.data.progress.version) {
        await redisService.set(`progress:${quizId}-${req.session.email}-${attemptId}`, JSON.stringify(req.body.data.progress));
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

router.get('/:quizId/result', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { attemptId } = req.query;
    if (!quizId) {
      throw new ClientException('Invalid QuizID!');
    }
    const attemptsCollection = await dbService.loadCollection(`${quizId}-attempts`);
    const attemptData = (await attemptsCollection.findOne({ email: req.session.email }));
    const resultsCollection = await dbService.loadCollection(`${quizId}-results`);
    const response = JSON.parse(await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`)).responses;
    if (!response || !attemptData || attemptData.attemptId !== attemptId) {
      res.send(await resultsCollection.findOne({ attemptId }));
      return;
    }
    const quizResult = await gradingService.gradeQuiz(
      quizId,
      attemptData.questions,
      response,
    );
    quizResult.attemptId = attemptId;
    quizResult.email = req.session.email;
    await resultsCollection.insertOne(quizResult);
    await attemptsCollection.deleteOne({ email: req.session.email });
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
    const quizCollection = await dbService.loadCollection('quizzes');
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
    const quizCollection = await dbService.loadCollection('quizzes');
    const quizId = nanoid16();
    quizCollection.insertOne(new QuizConstructor(req.body.data.quizName, quizId,
      req.body.data.questionCount, req.body.data.duration));
    res.send('Success!');
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.delete('/:quizId', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    throw new ClientException('Unauthorized!');
  }
  try {
    const quizCollection = await dbService.loadCollection('quizzes');
    const { quizId } = req.params;
    quizCollection.deleteOne({ quizId });
    res.send('Success!');
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
