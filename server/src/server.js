require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);
const rateLimit = require('express-rate-limit');
const history = require('connect-history-api-fallback');
const path = require('path');
const redis = require('./databases/redis');
const mongodb = require('./databases/mongodb');
const agenda = require('./jobs/agenda');
const questionAPI = require('./api/questionAPI');
const attemptAPI = require('./api/attemptAPI');
const quizAPI = require('./api/quizAPI');
const userAPI = require('./api/userAPI');
const resultAPI = require('./api/resultAPI');

async function startServer() {
  // Initialize database and job services
  await mongodb.connect();
  await agenda.connect();

  const app = express();

  // Add middleware to api service
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(cors({
    credentials: true,
  }));
  app.use(session({
    secret: process.env.COOKIESECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
    store: new RedisStore({ client: redis.client }),
  }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-control', 'no-cache');
    next();
  });
  app.use('/api', rateLimit({
    windowMs: 2000,
    max: process.env.RATELIMIT,
    keyGenerator: (req) => {
      if (req.session.email) {
        return req.session.email;
      }
      return req.ip;
    },
    message: { message: 'Rate limit reached, please try again later.' },
  }));

  app.use('/api/question', questionAPI);

  app.use('/api/attempt', attemptAPI);

  app.use('/api/quiz', quizAPI);

  app.use('/api/user', userAPI);

  app.use('/api/result', resultAPI);

  app.use('/api', (req, res) => {
    res.status(404).send('Invalid API Endpoint');
  });

  // eslint-disable-next-line no-unused-vars
  app.use('/api', (err, req, res, next) => {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(500).send('Internal Error!');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  // Serve frontend statics
  app.use(history());
  app.use(express.static(path.join(__dirname, '../dist')));

  const port = process.env.PORT || 5000;
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Server started on port ${port}`));
}

/* eslint-disable no-console */
const userService = require('./services/userService');

mongodb.connect()
  .then(
    () => mongodb.loadCollection('users'),
  ).then(
    (collection) => collection.find().count(),
  ).then((count) => {
    if (count === 0) {
      const userInfo = {
        name: process.env.USERNAME,
        email: process.env.USEREMAIL,
        role: 'admin',
        password: process.env.USERPASSWORD,
      };
      console.log(`Adding default user ${process.env.USEREMAIL} to database`);
      return userService.newUser(userInfo);
    }
    console.log('No initialization needed!');
    return { success: true };
  })
  .then((status) => {
    if (status.success) {
      startServer();
    } else {
      console.log('Error occurred during initialization!');
      process.exit(5);
    }
  });
