const express = require('express');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid20 = customAlphabet(alphabet, 20);
const validation = require('../../modules/dataValidation');
const dbService = require('../../modules/dbService');

const router = express.Router();

function QuestionConstructor(question, questionId) {
  this.questionId = questionId;
  this.context = question.context;
  this.points = question.points;
  this.type = question.type;
  if (question.type === 'single choice' || question.type === 'multiple choice' || question.type === 'fill in the blanks') {
    this.options = question.options;
  }
  if (question.type === 'matching') {
    this.rightcol = question.rightcol;
    this.leftcol = question.leftcol;
  }
}

function AnswerConstructor(question, questionId) {
  this.questionId = questionId;
  this.answer = question.answer;
}

function AllQuestionsListConstructor(questions, answers) {
  this.questions = questions;
  this.answers = answers;
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

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new Unauthorized('Admin Privileges Are Needed!');
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new BadRequest('QuizID Is Needed!');
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    let questionId = nanoid20();
    // eslint-disable-next-line no-await-in-loop
    while (await questionsCollection.findOne({ questionId })) {
      questionId = nanoid20();
    }
    validation.validateQuestion(req.body.data);
    const newQuestion = new QuestionConstructor(req.body.data, questionId);
    const newAnswer = new AnswerConstructor(req.body.data, questionId);
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
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

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new Unauthorized('Admin Privileges Are Needed!');
    }
    const { quizId } = req.query;
    if (!quizId) {
      throw new BadRequest('QuizID Is Needed!');
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const allQuestions = await questionsCollection.find({}).toArray();
    const allAnswers = await answersCollection.find({}).toArray();
    res.send(new AllQuestionsListConstructor(allQuestions, allAnswers));
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

router.delete('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new Unauthorized('Admin Privileges Are Needed!');
    }
    const { quizId } = req.query;
    const { questionId } = req.query;
    if (!quizId) {
      throw new BadRequest('QuizID Is Needed!');
    }
    if (!questionId) {
      throw new BadRequest('QuestionID Is Needed!');
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const questionsResponse = await questionsCollection.deleteOne({ questionId });
    const answersResponse = await answersCollection.deleteOne({ questionId });
    if (!questionsResponse.matchedCount || !answersResponse.matchedCount) {
      throw new NotFound('No Matched Quiz!');
    }
    res.send('Success!');
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

router.put('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      throw new Unauthorized('Admin Privileges Are Needed!');
    }
    const { quizId } = req.body.data;
    const { questionId } = req.query;
    if (!quizId) {
      throw new BadRequest('QuizID Is Needed!');
    }
    if (!questionId) {
      throw new BadRequest('QuestionID Is Needed!');
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const questionsResponse = await questionsCollection.updateOne(
      { questionId },
      QuestionConstructor(req.body.data, questionId),
    );
    const answersResponse = await answersCollection.updateOne(
      { questionId },
      AnswerConstructor(req.body.data, questionId),
    );
    if (!questionsResponse.matchedCount || !answersResponse.matchedCount) {
      throw new NotFound('No Matched Quiz!');
    }
    res.send('Success!');
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
