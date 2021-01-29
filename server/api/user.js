const express = require('express');

const router = express.Router();

const authService = require('../services/auth');
const userService = require('../services/user');

router.post('/session', async (req, res, next) => {
  try {
    if (!req.body.data || typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      res.status(400).send({ message: 'Invalid Login Information Syntax!' });
      return;
    }
    const response = await authService.login(req.body.data.email, req.body.data.password);
    // Success or unsuccess is sent together at the end to prevent hackers from guessing
    // if the email or the password is Invalid from response time.
    if (!response.success) {
      res.status(401).send({ message: 'Invalid Login Information!' });
    } else {
      req.session.email = response.data.email;
      req.session.role = response.data.role;
      req.session.loggedin = true;
      res.send({ data: 'Success!' });
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/session', (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    req.session.destroy();
    res.send({ data: 'Success!' });
  } catch (err) {
    next(err);
  }
});

router.get('/session', async (req, res, next) => {
  try {
    if (!req.session.loggedin || !req.session.email) {
      res.status(401).send({ message: 'Not Logged In!' });
      return;
    }
    const response = await authService.getInfo(req.session.email);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        req.session.destroy();
        res.status(404).send({ message: 'No Matching User!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.role !== 'admin') {
      res.status(403).send({ message: 'Need Admin Privileges!' });
      return;
    }
    const response = await userService.newUser(req.body.data);
    if (!response.success) {
      if (response.message === 'Invalid User Syntax!') {
        res.status(400).send({ message: 'Invalid User Syntax!' });
        return;
      }
      if (response.message === 'Email Already Exists!') {
        res.status(409).send({ message: 'Email Already Exists!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:email', async (req, res, next) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    res.status(403).send({ message: 'Need Admin Privileges!' });
    return;
  }
  try {
    const { email } = req.params;
    if (email === req.session.email) {
      res.status(400).send({ message: 'Can Not Delete Yourself!' });
      return;
    }
    const response = await userService.deleteUser(email);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        res.status(404).send({ message: 'No Matching User!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: 'Success!' });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:email', async (req, res, next) => {
  if (!req.session.loggedin || req.session.role !== 'admin') {
    res.status(403).send({ message: 'Need Admin Privileges!' });
    return;
  }
  try {
    const { email } = req.params;
    const response = await userService.updateUser(email, req.body.data);
    if (!response.success) {
      if (response.message === 'No Matching User!') {
        res.status(404).send({ message: 'No Matching User!' });
        return;
      }
      if (response.message === 'Invalid User Syntax!') {
        res.status(400).send({ message: 'Invalid User Syntax!' });
        return;
      }
      throw Error('Unexpected Service Response!');
    } else {
      res.send({ data: response.data });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
