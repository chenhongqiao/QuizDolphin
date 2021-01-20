const express = require('express');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid20 = customAlphabet(alphabet, 20);
const dbService = require('../../modules/dbService');

const router = express.Router();

function QuestionConstructor(question, questionId) {
  if (!question.context || !question.type
    || !question.points || !question.answer) {
    this.invalid = true;
  } else if (question.type !== 'single choice' && question.type !== 'multiple choice' && question.type !== 'short response'
    && question.type !== 'matching' && question.type !== 'fill in the blanks') {
    this.invalid = true;
  } else if (question.type === 'single choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || typeof question.answer !== 'string') {
      this.invalid = true;
    }
  } else if (question.type === 'multiple choice') {
    if (!Array.isArray(question.options) || typeof question.context !== 'string' || !Array.isArray(question.answer)) {
      this.invalid = true;
    }
  } else if (question.type === 'short response') {
    if (typeof question.context !== 'string' || typeof question.answer !== 'string') {
      this.invalid = true;
    }
  } else if (question.type === 'matching') {
    if (typeof question.context !== 'string' || !Array.isArray(question.answer)
      || !Array.isArray(question.leftcol) || !Array.isArray(question.rightcol)) {
      this.invalid = true;
    }
  } else if (question.type === 'fill in the blanks') {
    if (!Array.isArray(question.context) || !Array.isArray(question.answer)
      || !Array.isArray(question.options)) {
      this.invalid = true;
    }
    question.options.forEach((value) => {
      if (!Array.isArray(value)) {
        this.invalid = true;
      }
    });
  } else {
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
}

function AnswerConstructor(question, questionId) {
  this.questionId = questionId;
  this.answer = question.answer;
}

function AllQuestionsListConstructor(questions, answers) {
  this.questions = questions;
  this.answers = answers;
}

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      res.status(400).send('QuizId Is Required!');
      return;
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    let questionId = nanoid20();
    // eslint-disable-next-line no-await-in-loop
    while (await questionsCollection.findOne({ questionId })) {
      questionId = nanoid20();
    }
    const newQuestion = new QuestionConstructor(req.body.data, questionId);
    const newAnswer = new AnswerConstructor(req.body.data, questionId);
    if (newQuestion.invalid || newAnswer.invalid) {
      res.status(400).send('Incorrect Question Format!');
      return;
    }
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.query;
    if (!quizId) {
      res.status(400).send('QuizId Is Required!');
      return;
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const allQuestions = await questionsCollection.find({}).toArray();
    const allAnswers = await answersCollection.find({}).toArray();
    res.send(new AllQuestionsListConstructor(allQuestions, allAnswers));
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.query;
    const { questionId } = req.query;
    if (!quizId) {
      res.status(400).send('QuizId Is Required!');
      return;
    }
    if (!questionId) {
      res.status(400).send('QuestionID Is Required!');
      return;
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const questionsResponse = await questionsCollection.deleteOne({ questionId });
    const answersResponse = await answersCollection.deleteOne({ questionId });
    if (!questionsResponse.matchedCount || !answersResponse.matchedCount) {
      res.status(404).send('No Matching Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin || req.session.type !== 'admin') {
      res.status(403).send('Admin Privileges Are Required!');
      return;
    }
    const { quizId } = req.body.data;
    const { questionId } = req.query;
    if (!quizId) {
      res.status(400).send('QuizId Is Required!'); return;
    }
    if (!questionId) {
      res.status(400).send('QuestionID Is Required!');
      return;
    }
    const questionsCollection = await dbService.loadCollection(`${quizId}-questions`);
    const answersCollection = await dbService.loadCollection(`${quizId}-answers`);
    const newQuestion = new QuestionConstructor(req.body.data, questionId);
    const newAnswer = new AnswerConstructor(req.body.data, questionId);
    if (newQuestion.invalid || newAnswer.invalid) {
      res.status(400).send('Incorrect Question Format!');
      return;
    }
    const questionsResponse = await questionsCollection.updateOne({ questionId }, newQuestion);
    const answersResponse = await answersCollection.updateOne({ questionId }, newAnswer);
    if (!questionsResponse.matchedCount || !answersResponse.matchedCount) {
      res.status(404).send('No Matching Quiz!');
      return;
    }
    res.send('Success!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
