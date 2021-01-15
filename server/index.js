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
const redisService = require('./modules/redisService');

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
  store: new RedisStore({ client: redisService.client }),
}));
app.use('/api', rateLimit({
  windowMs: 1000,
  max: 4,
  keyGenerator: (req) => {
    if (req.session.email) {
      return req.session.email;
    }
    return req.ip;
  },
  message: 'Request too frequent, please try again later.',
}));

app.use(history());
app.use('/', express.static(path.join(__dirname, 'public')));

const questions = require('./routes/api/questions');

app.use('/api/questions', questions);

const heartbeat = require('./routes/api/heartbeat');

app.use('/api/heartbeat', heartbeat);

const quiz = require('./routes/api/quiz');

app.use('/api/quiz', quiz);

const users = require('./routes/api/users');

app.use('/api/users', users);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
