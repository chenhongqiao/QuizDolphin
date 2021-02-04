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
const questionAPI = require('./api/question');
const attemptAPI = require('./api/attempt');
const quizAPI = require('./api/quiz');
const userAPI = require('./api/user');
const resultAPI = require('./api/result');

async function startServer() {
  await mongodb.connect();
  await agenda.connect();

  const app = express();

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
    max: 6,
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
    res.status(404).send({ message: 'Invalid API Endpoint' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use('/api', (err, req, res, next) => {
    if (err.status) {
      res.status(err.status).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Internal Error!' });
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  app.use(history());
  app.use(express.static(path.join(__dirname, 'public')));

  const port = process.env.PORT || 5000;
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Server started on port ${port}`));
}
startServer();
