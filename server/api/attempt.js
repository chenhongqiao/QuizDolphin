const express = require('express');

const router = express.Router();

const attemptService = require('../services/attempt');
const gradingService = require('../services/grading');
const jobsService = require('../jobs/agenda');

router.get('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await attemptService.getProgress(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Progress!') {
        res.status(404).send({ message: 'No Matching Progress!' });
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

router.put('/:attemptId/progress', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    if (!req.body.data) {
      res.status(400).send({ message: 'Missing Body Data!' });
      return;
    }
    const response = await attemptService.postProgress(attemptId, req.body.data, req.session.email);
    if (!response.success) {
      if (response.message === 'Invalid Progress Syntax!') {
        res.status(400).send({ message: 'Invalid Progress Syntax!' });
        return;
      }
      if (response.message === 'No Matching Progress!') {
        res.status(404).send({ message: 'No Matching Progress!' });
        return;
      }
      if (response.message === 'Refuse To Overwrite!') {
        res.status(409).send({ message: 'Refuse To Overwrite!' });
        return;
      }
      if (response.message === 'Quiz Ended!') {
        res.status(410).send({ message: 'Quiz Ended!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.status(204).end();
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await attemptService.getAttemptData(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!') {
        res.status(404).send({ message: 'No Matching Attempt!' });
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
router.post('/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await gradingService.gradeQuiz(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!') {
        res.status(404).send({ message: 'No Matching Attempt!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      await jobsService.cancelJob(response.data, req.session.email);
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
