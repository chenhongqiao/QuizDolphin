const express = require('express');

const router = express.Router();

const questionService = require('../services/question');

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const response = await questionService.newQuestion(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Question Syntax!') {
        res.status(400).send({ message: 'Invalid Question Syntax!' });
        return;
      }
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await questionService.deleteQuestion(questionId);
    if (!response.success) {
      if (response.message === 'No Matching Question!') {
        res.status(404).send({ message: 'No Matching Question!' });
        return;
      }
    } else {
      res.send({ data: 'Success!' });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privilege!' });
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send({ message: 'Missing Parameter!' });
      return;
    }
    const response = await questionService.updateQuestion(questionId, req.body.data);

    if (!response.success) {
      if (response.message === 'Invalid Question Syntax!') {
        res.status(400).send({ message: 'Invalid Question Syntax!' });
        return;
      }
      if (response.message === 'No Matching Question!') {
        res.status(404).send({ message: 'No Matching Question!' });
        return;
      }
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
