const express = require('express');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const number = '0123456789';
const nanoid16 = customAlphabet(number, 16);
const nanoid20 = customAlphabet(alphabet, 20);

const router = express.Router();

const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');
const gradingService = require('../../modules/gradingService');

function QuizConstructor(quizInfo, quizId) {
  this.quizName = quizInfo.quizName;
  this.quizId = quizId;
  this.questionCount = quizInfo.questionCount;
  this.duration = quizInfo.duration;
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
router.get('/:quizId/attempt', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('QuizId Is Needed!');
      return;
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

      while (userQuestions.length < questionCount) {
        const index = getRandomInteger(0, allQuestionCount);
        if (!existedIndexs.has(index)) {
          userQuestions.push(allQuestions[index]);
          existedIndexs.add(index);
        }
      }
      const resultsCollection = await dbService.loadCollection(`${quizId}-results`);
      let attemptId = nanoid20();
      // eslint-disable-next-line no-await-in-loop
      while (await resultsCollection.findOne({ attemptId })
      // eslint-disable-next-line no-await-in-loop
      || await attemptsCollection.findOne({ attemptId })) {
        attemptId = nanoid20();
      }
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
    next(err);
  }
});

router.get('/:quizId/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('QuizId Is Needed!');
      return;
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
    next(err);
  }
});

router.get('/:quizId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { attemptId } = req.query;
    if (!quizId) {
      res.status(400).send('QuizId Is Needed!');
      return;
    }
    res.send(JSON.parse((await redisService.get(`progress:${quizId}-${req.session.email}-${attemptId}`))));
  } catch (err) {
    next(err);
  }
});

router.post('/:quizId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { attemptId } = req.body.data.progress;
    if (!quizId) {
      res.status(400).send('QuizId Is Needed!');
      return;
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
    next(err);
  }
});

router.post('/:quizId/attempt/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { attemptId } = req.params;
    if (!quizId) {
      res.status(400).send('QuizId Is Needed!');
      return;
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
    await redisService.del(`endTime:${quizId}-${req.session.email}-${attemptId}`);
    res.send(quizResult);
  } catch (err) {
    next(err);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    const quizCollection = await dbService.loadCollection('quizzes');
    const allQuiz = await quizCollection.find({}).toArray();
    res.send(allQuiz);
  } catch (err) {
    next(err);
  }
});

// Below are admin apis

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Needed!');
      return;
    }
    const quizCollection = await dbService.loadCollection('quizzes');
    const quizId = nanoid16();
    await quizCollection.insertOne(new QuizConstructor(req.body.data, quizId));
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.delete('/:quizId', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    res.status(403).send('Admin Privileges Are Needed!');
    return;
  }
  try {
    const quizCollection = await dbService.loadCollection('quizzes');
    const { quizId } = req.params;
    const dbResponse = await quizCollection.deleteOne({ quizId });
    if (!dbResponse.matchedCount) {
      res.status(404).send('No Matched Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.put('/:quizId', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    res.status(403).send('Admin Privileges Are Needed!');
    return;
  }
  try {
    const quizCollection = await dbService.loadCollection('quizzes');
    const { quizId } = req.params;
    const dbResponse = await quizCollection.updateOne(
      { quizId },
      new QuizConstructor(req.body.data, quizId),
    );
    if (!dbResponse.matchedCount) {
      res.status(404).send('No Matched Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
