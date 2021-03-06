// Question APIs
const express = require('express');

const router = express.Router();

const questionService = require('../services/questionService');

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
    const response = await questionService.newQuestion(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Question Syntax!') {
        res.status(400).send('Invalid Question Syntax!');
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

router.get('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await questionService.getQuestion(questionId);
    if (!response.success) {
      if (response.message === 'No Matching Question!') {
        res.status(404).send('No Matching Question!');
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

router.delete('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await questionService.deleteQuestion(questionId);
    if (!response.success) {
      if (response.message === 'No Matching Question!') {
        res.status(404).send('No Matching Question!');
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

router.put('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await questionService.updateQuestion(questionId, req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Question Syntax!') {
        res.status(400).send('Invalid Question Syntax!');
        return;
      }
      if (response.message === 'No Matching Question!') {
        res.status(404).send('No Matching Question!');
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

module.exports = router;
