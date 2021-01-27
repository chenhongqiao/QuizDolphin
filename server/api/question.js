const express = require('express');

const router = express.Router();

const questionService = require('../services/question');

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const response = await questionService.newQuestion(req.body.data);
    if (!response.success) {
      if (response.message === 'Incorrect Question Syntax!') {
        res.status(400).send('Incorrect Question Syntax!');
        return;
      }
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send('QuestionID Is Required!');
      return;
    }
    const response = await questionService.deleteQuestion(questionId);
    if (!response.success) {
      if (response.message === 'No Matching Question!') {
        res.status(404).send('No Matching Question!');
        return;
      }
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:questionId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { questionId } = req.params;
    if (!questionId) {
      res.status(400).send('QuestionID Is Required!');
      return;
    }
    const response = await questionService.updateQuestion(questionId, req.body.data);

    if (!response.success) {
      if (response.message === 'Incorrect Question Syntax!') {
        res.status(400).send('Incorrect Question Syntax!');
        return;
      }
      if (response.message === 'No Matching Question!') {
        res.status(404).send('No Matching Question!');
        return;
      }
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
