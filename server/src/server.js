require('dotenv').config();
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
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
  const app = express();

  // Add middleware to api service
  app.use(bodyParser.json());
  app.use(cors({
    credentials: true,
  }));
  app.use(session({
    secret: process.env.COOKIE_SECRET,
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
    max: process.env.RATE_LIMIT,
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

  const port = process.env.SERVER_PORT || 5000;
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Server started on port ${port}`));
}

/* eslint-disable no-console */
const userService = require('./services/userService');
const quizService = require('./services/quizService');
const questionService = require('./services/questionService');

(async () => {
  try {
    await mongodb.connect();
    await agenda.connect();
    if (!(await userService.getUserList()).data.length) {
      // Perform initialization only if there's no user exist in the system
      console.log(`Adding default user ${process.env.ADMIN_EMAIL} to database`);
      if (!(await userService.newUser({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
        password: process.env.ADMIN_PASSWORD,
      })).success) {
        throw Error('Error while adding init user!');
      }
      // Add demo quiz
      console.log('Adding Demo Quiz to database');
      const newId = (await quizService.newQuiz({
        quizName: 'Demo Quiz',
        duration: 300,
        questionCount: 5,
        maxAttempts: 20,
      }));
      if (!newId.success) {
        throw Error('Error while adding demo quiz!');
      }
      console.log('Adding questions to Demo Quiz');
      // Read demo qeustions from file
      const questions = JSON.parse(fs.readFileSync('./demo/questions.json'));
      const responses = [];
      for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        question.quizId = newId.data;
        responses.push(questionService.newQuestion(question));
      }
      // Wait for all operations to finish
      const resolvedResponses = await Promise.all(responses);
      for (let index = 0; index < resolvedResponses.length; index += 1) {
        if (!resolvedResponses[index].success) {
          throw Error('Error while adding demo questions!');
        }
      }
      console.log('Initialization finished!');
    } else {
      console.log('No initialization needed!');
    }
  } catch (err) {
    console.error(err);
    process.exit(5);
  }
  await startServer();
})();
