const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://localhost:8080',
  ],
  credentials: true,
}));
app.use(session({
  secret: 'ef41b182f3883634f166e1aa3595339923635e76',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
  },
}));

const questions = require('./routes/api/questions');

app.use('/api/questions', questions);

const heartbeat = require('./routes/api/heartbeat');

app.use('/api/heartbeat', heartbeat);

const grading = require('./routes/api/grading');

app.use('/api/grading', grading);

const quiz = require('./routes/api/quiz');

app.use('/api/quiz', quiz);

const users = require('./routes/api/users');

app.use('/api/users', users);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
