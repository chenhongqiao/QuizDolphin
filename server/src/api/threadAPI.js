const express = require('express');

const router = express.Router();

const threadService = require('../services/threadService');

router.post('/question', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await threadService.newQuestion(req.session.email, req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Thread Syntax!') {
        res.status(400).send('Invalid Thread Syntax!');
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

router.put('/:threadId/answer', async (req, res, next) => {
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
    const { threadId } = req.params;
    if (!threadId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await threadService.postAnswer(threadId, req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid Thread Syntax!') {
        res.status(400).send('Invalid Thread Syntax!');
        return;
      }
      if (response.message === 'No Such Question!') {
        res.status(404).send('No Such Question!');
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

router.delete('/:threadId', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { threadId } = req.params;
    if (!threadId) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await threadService.deleteThread(threadId);
    if (!response.success) {
      if (response.message === 'No Matching Thread!') {
        res.status(404).send('No Matching Thread!');
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

router.get('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    const response = await threadService.fetchThreads();
    if (!response.success) {
      throw Error('Unexpected Service Response!');
    } else {
      res.json(response.data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
