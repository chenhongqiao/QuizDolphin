const express = require('express');

const router = express.Router();

const attemptService = require('../services/attempt');
const gradingService = require('../services/grading');

router.get('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await attemptService.getProgress(attemptId);
    if (!response.success) {
      if (response.message === 'No Matching Progress!') {
        res.status(404).send('No Matching Progress!');
        return;
      }
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing');
      return;
    }
    const response = await attemptService.postProgress(attemptId, req.body.data);
    if (!response.success) {
      if (response.message === 'No Matching Progress!') {
        res.status(404).send('No Matching Progress!');
        return;
      }
      if (response.message === 'Refuse To Overwrite!') {
        res.status(409).send('Refuse To Overwrite!');
        return;
      }
      if (response.message === 'Quiz Ended!') {
        res.status(410).send('Quiz Ended!');
        return;
      }
    } else {
      res.send(response.data);
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
    const response = await attemptService.getAttemptData(attemptId);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!') {
        res.status(404).send('No Matching Attempt!');
        return;
      }
    } else {
      res.send(response.data);
    }
    res.send();
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
    const response = await gradingService.gradeQuiz(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!' || response.message === 'No Privileges!') {
        res.status(404).send('No Matching Attempt!');
        return;
      }
    } else {
      res.send(response.data);
    }
    res.send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
