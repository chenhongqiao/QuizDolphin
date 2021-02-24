// Quiz APIs
const express = require('express');

const router = express.Router();

const quizService = require('../services/quizService');
const jobsService = require('../jobs/agenda');

router.get('/:quizId?/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { viewAll } = req.query;
    let response;
    if (viewAll && req.session.role === 'admin') {
      response = await quizService.getOngoingId(req.session.email, quizId, true);
    } else {
      response = await quizService.getOngoingId(req.session.email, quizId, false);
    }
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/attempt', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.newAttempt(quizId, req.session.email, req.session.name, req.session.role === 'admin');
    if (!response.success) {
      if (response.message === 'No Simultaneous Attempts Allowed!') {
        res.status(409).send('No Simultaneous Attempts Allowed!');
        return;
      }
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      } if (response.message === 'Quiz Not Enabled!') {
        res.status(400).send('Quiz Not Enabled!');
        return;
      } if (response.message === 'Max Attempts Reached!') {
        res.status(400).send('Max Attempts Reached!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      await jobsService.gradeQuiz(
        response.data.attemptId, response.data.email, response.data.endTime,
      );
      res.send(response.data.attemptId);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId?/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    const { viewAll } = req.query;
    let response;
    if (viewAll && req.session.role === 'admin') {
      response = await quizService.getHistoryId(req.session.email, quizId, true);
    } else {
      response = await quizService.getHistoryId(req.session.email, quizId, false);
    }
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:quizId/info', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.getQuizInfo(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
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
    const response = await quizService.getQuizList();
    if (!response.success) {
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

// Below are admin apis

router.get('/:quizId/questions', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.getQuestions(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:quizId/enable', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.enableQuiz(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:quizId/disable', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.disableQuiz(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await quizService.newQuiz(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Quiz Syntax!') {
        res.status(400).send('Invalid Quiz Syntax!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await quizService.deleteQuiz(quizId);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:quizId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { quizId } = req.params;
    if (!quizId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await quizService.updateQuiz(quizId, req.body.data);
    if (!response.success) {
      if (response.message === 'No Matching Quiz!') {
        res.status(404).send('No Matching Quiz!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
