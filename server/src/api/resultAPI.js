// Result APIs
const express = require('express');

const router = express.Router();

const resultService = require('../services/resultService');

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
    const response = await resultService.getResult(attemptId, req.session.email, req.session.role === 'admin');
    if (!response.success) {
      if (response.message === 'No Matching Result!') {
        res.status(404).send('No Matching Result!');
        return;
      }
      throw new Error('Unexpected Service Response!');
    } else {
      res.send(response.data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
