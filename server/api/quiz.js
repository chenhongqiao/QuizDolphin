const express = require('express');

const router = express.Router();

const quizService = require('../services/quiz');

router.get('/:quizId/attempt', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Query!');
      return;
    }
    const attemptId = await quizService.quizAttemptId(req.session.email, quizId);
    if (attemptId) {
      res.send(attemptId);
    } else if (req.query.newQuiz === 'true') {
      res.send(await quizService.newAttempt(quizId, req.session.email));
    } else {
      res.send('No Ongoing Attempt!');
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('QuizId Is Required!');
      return;
    }

    const history = await quizService.quizResults(req.session.email, quizId);
    if (!Array.isArray(history) || history.length === 0) {
      res.send('No History!');
    } else {
      res.send(history);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    res.send(await quizService.quizList());
  } catch (err) {
    next(err);
  }
});

// Below are admin apis

router.get('/:quizId/questions', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.params;
    res.send(await quizService.getQuestions(quizId));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    await quizService.newQuiz(req.body.data);
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.delete('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.params;
    const status = await quizService.deleteQuiz(quizId);
    if (!status.matchedCount) {
      res.status(404).send('No Matching Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.put('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.params;
    const status = await quizService.updateQuiz(quizId, req.body.data);
    if (!status.matchedCount) {
      res.status(404).send('No Matching Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
