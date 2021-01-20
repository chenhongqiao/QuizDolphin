const express = require('express');
const crypto = require('crypto');
const dbService = require('../../modules/dbService');

const router = express.Router();

function getSaltedPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

function UserConstructor(userInfo) {
  this.email = userInfo.email;
  this.name = userInfo.name;
  this.type = userInfo.type;
  this.salt = crypto.randomBytes(32).toString('hex');
  this.password = getSaltedPassword(this.password, this.salt);
}

function UserInformationConstructor(user) {
  this.email = user.email;
  this.name = user.name;
  this.type = user.type;
}

router.post('/session', async (req, res, next) => {
  try {
    if (!req.body.data || typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      res.status(400).send('Invalid Login Information Syntax!');
      return;
    }
    let success = false;
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
    if (success) {
      req.session.loggedin = true;
      req.session.email = req.body.data.email;
      req.session.type = userInformation.type;
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
      req.session.loggedin = false;
      req.session.email = '';
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
    if (req.session.loggedin === true) {
      const usersCollection = await dbService.loadCollection('users');
      const userInformation = await usersCollection.findOne({ email: req.session.email });
      const processedInformation = new UserInformationConstructor(userInformation);
      res.send(processedInformation);
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
    const usersCollection = await dbService.loadCollection('users');

    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string'
    || typeof req.body.data.type !== 'string' || typeof req.body.data.name !== 'string') {
      res.status(400).send('Invalid Login Information Syntax!');
      return;
    }
    const userWithSameEmail = await usersCollection.findOne({ email: req.body.data.email });
    if (await userWithSameEmail) {
      res.send('Email Already Exists!');
    } else {
      await usersCollection.insertOne(
        new UserConstructor(req.body.data),
      );
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
    const usersCollection = await dbService.loadCollection('users');
    const { email } = req.params;
    if (email === req.session.email) {
      res.status(400).send('Can Not Delete Yourself!');
      return;
    }
    const dbResponse = await usersCollection.deleteOne({ email });
    if (!dbResponse.matchedCount) {
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
    const usersCollection = await dbService.loadCollection('quizzes');
    const { email } = req.params;
    const dbResponse = await usersCollection.updateOne(
      { email },
      new UserConstructor(req.body.data),
    );
    if (!dbResponse.matchedCount) {
      res.status(404).send('No Matching User!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
