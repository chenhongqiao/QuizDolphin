// User APIs
const express = require('express');

const router = express.Router();

const authService = require('../services/authService');
const userService = require('../services/userService');

const randomUtil = require('../utils/randomUtil');

router.post('/session', async (req, res, next) => {
  try {
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      res.status(400).send('Invalid Login Information Syntax!');
      return;
    }
    const response = await authService.login(req.body.data.email, req.body.data.password);
    // Sleep for 100~300ms to prevent timing attack and disguise auth behavior
    await new Promise((resolve) => setTimeout(resolve, randomUtil.integer(100, 300)));
    if (!response.success) {
      res.status(401).send('Invalid Login Information!');
    } else {
      req.session.email = response.data.email;
      req.session.name = response.data.name;
      req.session.role = response.data.role;
      req.session.loggedin = true;
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/session', (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    req.session.destroy();
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.get('/session', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.send(null);
      return;
    }
    const response = await authService.getInfo(req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        req.session.destroy();
        res.status(404).send('No Matching User!');
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

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const response = await userService.getUserList();
    if (!response.success) {
      throw Error('Unexpected Service Response!');
    } else {
      res.json(response.data);
    }
  } catch (err) {
    next(err);
  }
});

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
    const response = await userService.newUser(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid User Syntax!') {
        res.status(400).send('Invalid User Syntax!');
        return;
      }
      if (response.message === 'Email Already Exists!') {
        res.status(409).send('Email Already Exists!');
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

router.delete('/:email', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { email } = req.params;
    if (!email) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    if (email === req.session.email) {
      res.status(400).send('Can Not Delete Yourself!');
      return;
    }
    const response = await userService.deleteUser(email);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        res.status(404).send('No Matching User!');
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

router.put('/:email', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { email } = req.params;
    if (!email) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    if (!req.body.data) {
      res.status(400).send('Missing Body Data!');
      return;
    }
    const response = await userService.updateUser(email, req.body.data);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        res.status(404).send('No Matching User!');
        return;
      }
      if (response.message === 'Invalid User Syntax!') {
        res.status(400).send('Invalid User Syntax!');
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

router.get('/:email', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send('Not Logged In!');
      return;
    }
    if (req.session.role !== 'admin') {
      res.status(403).send('Insufficient Privilege!');
      return;
    }
    const { email } = req.params;
    if (!email) {
      res.status(400).send('Missing Parameter!');
      return;
    }
    const response = await userService.getUserInfo(email);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        res.status(404).send('No Matching User!');
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
