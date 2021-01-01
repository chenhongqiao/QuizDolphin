const express = require('express');
const crypto = require('crypto');
const dbService = require('../../modules/dbService');

const router = express.Router();

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

function UserConstructor(email, password) {
  this.email = email;
  this.salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHmac('sha512', this.salt);
  hash.update(password);
  this.password = hash.digest('hex');
}

router.post('/', async (req, res, next) => {
  try {
    const usersCollection = await dbService.loadCollection('users');

    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      throw new UserException('Invalid User Data!');
    }
    const usersWithSameEmail = (await usersCollection.find({ email: req.body.data.email }))
      .toArray();
    if ((await usersWithSameEmail).length !== 0) {
      res.send('Email Already Exists!');
    } else {
      await usersCollection.insertOne(
        new UserConstructor(req.body.data.email, req.body.data.password),
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
module.exports = router;
