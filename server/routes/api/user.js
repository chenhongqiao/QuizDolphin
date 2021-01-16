const express = require('express');
const crypto = require('crypto');
const dbService = require('../../modules/dbService');

const router = express.Router();

function getSaltedPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

function BadRequest(message, email, ip) {
  this.message = message;
  this.email = email;
  this.ip = ip;
}

function Unauthorized(message, email, ip) {
  this.message = message;
  this.email = email;
  this.ip = ip;
}

function NotFound(message, email, ip) {
  this.message = message;
  this.email = email;
  this.ip = ip;
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

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new Unauthorized('Admin Privileges Are Needed!');
    }
    const usersCollection = await dbService.loadCollection('users');

    if (typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string'
    || typeof req.body.data.type !== 'string' || typeof req.body.data.name !== 'string') {
      throw new BadRequest('Invalid User Information Syntax!');
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
    if (err instanceof BadRequest) {
      res.status(400).send(err.message);
      next(`BadRequest from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof Unauthorized) {
      res.status(403).send(err.message);
      next(`Unauthorized from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof NotFound) {
      res.status(404).send(err.message);
      next(`NotFound from ${err.ip} ${err.email} ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!req.body.data || typeof req.body.data.email !== 'string' || typeof req.body.data.password !== 'string') {
      throw new BadRequest('Invalid Login Information Syntax!');
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
      res.send('Incorrect Login Information!');
    }
  } catch (err) {
    if (err instanceof BadRequest) {
      res.status(400).send(err.message);
      next(`BadRequest from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof Unauthorized) {
      res.status(403).send(err.message);
      next(`Unauthorized from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof NotFound) {
      res.status(404).send(err.message);
      next(`NotFound from ${err.ip} ${err.email} ${err.message}`);
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
    if (err instanceof BadRequest) {
      res.status(400).send(err.message);
      next(`BadRequest from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof Unauthorized) {
      res.status(403).send(err.message);
      next(`Unauthorized from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof NotFound) {
      res.status(404).send(err.message);
      next(`NotFound from ${err.ip} ${err.email} ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

router.get('/current', async (req, res, next) => {
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
    if (err instanceof BadRequest) {
      res.status(400).send(err.message);
      next(`BadRequest from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof Unauthorized) {
      res.status(403).send(err.message);
      next(`Unauthorized from ${err.ip} ${err.email} ${err.message}`);
    } else if (err instanceof NotFound) {
      res.status(404).send(err.message);
      next(`NotFound from ${err.ip} ${err.email} ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

module.exports = router;
