const express = require('express');

const router = express.Router();

const questionService = require('../services/question');

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    await questionService.newQuestion(req.body.data);
    res.send('Success!');
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
    const status = questionService.deleteQuestion(questionId);
    if (!status.matchedCount) {
      res.status(404).send('No Matching Quiz!');
      return;
    }
    res.send('Success!');
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
    const status = await questionService.updateQuestion(questionId, req.body.data);

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
