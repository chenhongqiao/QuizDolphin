// Attempt APIs
const express = require('express');

const router = express.Router();

const attemptService = require('../services/attemptService');
const gradingService = require('../services/gradingService');
const jobsService = require('../jobs/agenda');

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
    const response = await attemptService.getProgress(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Progress!') {
        res.status(404).send('No Matching Progress!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.json(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:attemptId/progress', async (req, res, next) => {
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
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await attemptService.putProgress(attemptId, req.body.data, req.session.email);
    if (!response.success) {
      if (response.message === 'Invalid Progress Syntax!') {
        res.status(400).send('Invalid Progress Syntax!');
        return;
      }
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
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await attemptService.getAttemptData(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!') {
        res.status(404).send('No Matching Attempt!');
        return;
      }
      if (response.message === 'Quiz Ended!') {
        res.status(410).send('Quiz Ended!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.json(response.data);
    }
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
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await gradingService.gradeQuiz(attemptId, req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching Attempt!') {
        res.status(404).send('No Matching Attempt!');
        return;
      }
      if (response.message === 'Quiz Ended!') {
        res.status(410).send('Quiz Ended!');
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      await jobsService.cancelJob(response.data, req.session.email);
      res.json(response.data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
