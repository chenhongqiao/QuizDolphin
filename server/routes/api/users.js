const express = require('express');
const crypto = require('crypto');
const dbService = require('../../modules/dbService');

const router = express.Router();

function getSaltedPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

function UserConstructor(email, password, name, type) {
  this.email = email;
  this.name = name;
  this.type = type;
  this.salt = crypto.randomBytes(32).toString('hex');
  this.password = getSaltedPassword(password, this.salt);
}

function UserInformationConstructor(user) {
  this.email = user.email;
  this.name = user.name;
  this.type = user.type;
}

router.post('/new', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new UserException('Unauthorized!');
    }
    const usersCollection = await dbService.loadCollection('users');

    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string'
    || typeof req.body.data.type !== 'string' || typeof req.body.data.name !== 'string') {
      throw new UserException('Invalid User Information Type!');
    }
    const userWithSameEmail = await usersCollection.findOne({ email: req.body.data.email });
    if (await userWithSameEmail) {
      res.send('Email Already Exists!');
    } else {
      await usersCollection.insertOne(
        new UserConstructor(req.body.data.email, req.body.data.password,
          req.body.data.name, req.body.data.type),
      );
      res.send('Success!');
    }
  } catch (err) {
    if (err.type === 'UserException') {
      res.status(400).send(err.message);
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!req.body.data || typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      throw new UserException('Invalid Login Information Type!');
    }
    let success = null;
    const usersCollection = await dbService.loadCollection('users');
    const userInformation = await usersCollection.findOne({ email: req.body.data.email });
    if (!userInformation) {
      success = false;
    } else {
      const saltedPassword = getSaltedPassword(req.body.data.password, userInformation.salt);
      if (saltedPassword === userInformation.password) {
        success = true;
      } else {
        success = false;
      }
    }
    // Success or unsuccess is sent together at the end to prevent hackers from guessing
    // if the email or the password is incorrect from response time.
    if (success === true) {
      req.session.loggedin = true;
      req.session.email = req.body.data.email;
      req.session.type = userInformation.type;
      res.send('Success!');
    } else if (success === false) {
      res.send('Incorrect Login Information!');
    } else {
      throw new Error('LogicError: variable success is never mutated');
    }
  } catch (err) {
    if (err.type === 'UserException') {
      res.status(400).send(err.message);
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.post('/logout', (req, res, next) => {
  try {
    if (req.session.loggedin === true) {
      req.session.loggedin = false;
      req.session.email = '';
      res.send('Success!');
    } else {
      res.send('Not Logged In!');
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.get('/information', async (req, res, next) => {
  try {
    if (req.session.loggedin === true) {
      const usersCollection = await dbService.loadCollection('users');
      const userInformation = await usersCollection.findOne({ email: req.session.email });
      const processedInformation = new UserInformationConstructor(userInformation);
      res.send(processedInformation);
    } else {
      res.send('Not Logged In!');
    }
  } catch (err) {
    if (typeof err === 'object') {
      if (err.type === 'UserException') {
        res.status(400).send(err.message);
      }
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

module.exports = router;
