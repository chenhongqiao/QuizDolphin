const express = require('express');

const router = express.Router();

const quizService = require('../services/quiz');

router.get('/:quizId/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await quizService.getOngoingId(req.session.email, quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/attempt', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await quizService.newAttempt(quizId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Simultaneous Attempts Allowed!') {
        res.status(409).send({ message: 'No Simultaneous Attempts Allowed!' });
        return;
      }
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }

    const response = await quizService.getHistoryId(req.session.email, quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const response = await quizService.getQuizList(req.session.email);
    if (!response.success) {
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

// Below are admin apis

router.get('/:quizId/questions', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.role !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const { quizId } = req.params;
    const response = await quizService.getQuestions(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.role !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const response = await quizService.newQuiz(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Quiz Syntax!') {
        res.status(400).send({ message: 'Invalid Quiz Syntax!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.role !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const { quizId } = req.params;
    const response = await quizService.deleteQuiz(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: 'Success!' });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.role !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const { quizId } = req.params;
    const response = await quizService.updateQuiz(quizId, req.body.data);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send({ message: 'No Matching Quiz!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
