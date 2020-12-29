const express = require('express');
const mongodb = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

function QuestionConstructor(question, uuid) {
  this.uuid = uuid;
  this.context = question.context;
  this.points = question.points;
  this.type = question.type;
  this.options = question.options;
}

function AnswerConstructor(question, uuid) {
  this.uuid = uuid;
  this.answer = question.answer;
}

async function loadQuestionsCollection() {
  const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client.db('server').collection('questions');
}

async function loadAnswersCollection() {
  const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client.db('server').collection('answers');
}

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

router.get('/', async (req, res) => {
  const questionsCollection = await loadQuestionsCollection().catch();
  const allQuestions = await questionsCollection.find({}).toArray();
  const allQuestionCount = allQuestions.length;
  const userQuestions = [];
  const existedIndexs = new Set();
  if (req.query.count > allQuestionCount) {
    res.send('Error: Wrong Question Count!');
  } else {
    while (userQuestions.length < req.query.count) {
      const index = getRandomInteger(0, allQuestionCount);
      if (!existedIndexs.has(index)) {
        userQuestions.push(allQuestions[index]);
        existedIndexs.add(index);
      }
    }
    res.send(userQuestions);
  }
});

/*
TODO:
- Authenication
- Duplicated uuid handle
*/
router.post('/', async (req, res) => {
  const questionsCollection = await loadQuestionsCollection();
  const answersCollection = await loadAnswersCollection();
  const questionId = uuidv4();
  const newQuestion = new QuestionConstructor(req.body, questionId);
  const newAnswer = new AnswerConstructor(req.body, questionId);
  await questionsCollection.insertOne(newQuestion);
  await answersCollection.insertOne(newAnswer);
  res.send('Success!');
});

module.exports = router;
