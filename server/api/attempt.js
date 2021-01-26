const express = require('express');

const router = express.Router();

const attemptService = require('../services/attempt');
const gradingService = require('../services/grading');

router.get('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    res.send(await attemptService.getProgress(attemptId));
  } catch (err) {
    next(err);
  }
});

router.post('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing');
      return;
    }
    res.send(await attemptService.postProgress(attemptId, req.body.data));
  } catch (err) {
    next(err);
  }
});

router.get('/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Parameters!');
      return;
    }
    res.send(await attemptService.getAttemptData(attemptId));
  } catch (err) {
    next(err);
  }
});
router.post('/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Parameters!');
      return;
    }
    res.send(await gradingService.gradeQuiz(attemptId, req.session.email));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
