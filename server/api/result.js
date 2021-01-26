const express = require('express');

const router = express.Router();

const resultService = require('../services/result');

router.get('/:attemptId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const { attemptId } = req.params;
    if (!attemptId) {
      res.status(400).send('Missing Paramater!');
      return;
    }
    console.log(attemptId);
    const quizResult = await resultService.getResult(attemptId);
    console.log(quizResult);
    res.send(quizResult);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
