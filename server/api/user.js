const express = require('express');

const router = express.Router();

const authService = require('../services/auth');
const userService = require('../services/user');

router.post('/session', async (req, res, next) => {
  try {
    if (!req.body.data || typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      res.status(400).send('Invalid Login Information Syntax!');
      return;
    }
    // eslint-disable-next-line max-len
    const status = await authService.login(req.body.data.email, req.body.data.password, req.session);
    // Success or unsuccess is sent together at the end to prevent hackers from guessing
    // if the email or the password is incorrect from response time.
    if (status) {
      res.send('Success!');
    } else {
      res.status(401).send('Incorrect Login Information!');
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/session', (req, res, next) => {
  try {
    if (req.session.loggedin === true) {
      req.session.destroy();
      res.send('Success!');
    } else {
      res.status(401).send('Not Logged In!');
      return;
    }
  } catch (err) {
    next(err);
  }
});

router.get('/session', async (req, res, next) => {
  try {
    if (req.session.loggedin === true && req.session.email) {
      const userInfo = await authService.info(req.session.email);
      res.send(userInfo);
    } else {
      res.status(401).send('Not Logged In!');
      return;
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string'
    || typeof req.body.data.type !== 'string' || typeof req.body.data.name !== 'string') {
      res.status(400).send('Invalid Login Information Syntax!');
      return;
    }

    const status = await userService.newUser(req.body.data);
    if (status === 'Email Already Exists!') {
      res.send('Email Already Exists!');
    } else {
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:email', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    res.status(403).send('Admin Privileges Are Required!');
    return;
  }
  try {
    const { email } = req.params;
    if (email === req.session.email) {
      res.status(400).send('Can Not Delete Yourself!');
      return;
    }
    const status = await userService.deleteUser(email);
    if (!status.matchedCount) {
      res.status(404).send('No Matching User!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.put('/:email', async (req, res, next) => {
  if (!req.session.loggedin || req.session.type !== 'admin') {
    res.status(403).send('Admin Privileges Are Required!');
    return;
  }
  try {
    const { email } = req.params;
    const status = await userService.updateUser(email, req.body.data);
    if (!status.matchedCount) {
      res.status(404).send('No Matching User!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
