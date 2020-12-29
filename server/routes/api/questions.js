const express = require('express');
const mongodb = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

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
  const newQuestion = req.body;
  newQuestion.uuid = questionId;
  const newAnswer = {
    uuid: questionId,
    answer: req.body.answer,
  };
  delete newQuestion.answer;
  await questionsCollection.insertOne(newQuestion);
  await answersCollection.insertOne(newAnswer);
  res.send('Success!');
});

router.post('/grade', async (req, res) => {
  const answersCollection = await loadAnswersCollection();
  const questionsCollection = await loadQuestionsCollection();
  const score = req.body.answers.reduce(async (accumulator, current) => {
    const questionUuid = current.uuid;
    const correctAnswersArray = await answersCollection.find({ uuid: questionUuid }).toArray();
    const questionsArray = await questionsCollection.find({ uuid: questionUuid }).toArray();
    if (questionsArray[0].type === 'single choice' || questionsArray[0].type === 'short response') {
      if (correctAnswersArray[0].answer === current.answer) {
        return (await accumulator) + (questionsArray[0]).points;
      }
      return accumulator;
    }
    if (questionsArray[0].type === 'multiple choice') {
      const answersSet = new Set(correctAnswersArray[0].answer);
      const correctCount = current.answer.reduce((countAccumulator, currentOption) => {
        if (answersSet.has(currentOption)) {
          return countAccumulator + 1;
        }
        return -Infinity;
      }, 0);
      if (correctCount < 0) {
        return accumulator;
      }
      return (await accumulator) + (questionsArray[0].points * (correctCount / answersSet.size));
    }
    return accumulator;
  }, Promise.resolve(0));
  res.send({ score: await score });
});

module.exports = router;
