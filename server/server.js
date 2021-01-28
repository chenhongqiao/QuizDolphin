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

app.use(history());
app.use('/', express.static(path.join(__dirname, 'public')));

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

const question = require('./api/question');

app.use('/api/question', question);

const attempt = require('./api/attempt');

app.use('/api/attempt', attempt);

const quiz = require('./api/quiz');

app.use('/api/quiz', quiz);

const user = require('./api/user');

app.use('/api/user', user);

const result = require('./api/result');

app.use('/api/result', result);

app.use('/api', (err, req, res) => {
  if (err) {
    res.status(500).send('Internal Error');
    // eslint-disable-next-line no-console
    console.error(err);
  }
});

const port = process.env.PORT || 5000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server started on port ${port}`));
