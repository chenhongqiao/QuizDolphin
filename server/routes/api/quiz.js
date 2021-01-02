const express = require('express');
const { promisify } = require('util');

const router = express.Router();

const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');

router.get('/history', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const historyCollection = await dbService.loadCollection('history');
    const userHistory = await historyCollection.findOne({ email: req.session.email });
    if (userHistory === null) {
      res.send('No History!');
    } else {
      res.send(userHistory.history);
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.get('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const redis = redisService.loadDatabase(0);
    const redisGet = promisify(redis.get).bind(redis);
    res.send(await redisGet(req.session.email));
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

router.post('/ongoing', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const redis = redisService.loadDatabase(0);
    const redisGet = promisify(redis.get).bind(redis);
    const redisSet = promisify(redis.set).bind(redis);
    const current = JSON.parse((await redisGet(req.session.email)));
    if (!current.version || current.version < res.body.data.version) {
      await redisSet(res.session.email, JSON.stringify(res.body.data.attempt));
      res.send('Success!');
    } else {
      res.send('Refuse to overwrite newer version with older one!');
    }
  } catch (err) {
    res.status(500).send('Internal Error!');
    next(err);
  }
});

module.exports = router;
