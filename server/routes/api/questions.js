const express = require('express');
const mongodb = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

async function loadQuestionsCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return client.db('server').collection('questions');
}

async function loadAnswersCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return client.db('server').collection('answers');
}


function getRandomInteger(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

router.get('/', async (req, res) => {
    const questionsCollection = await loadQuestionsCollection();
    const allQuestions = await questionsCollection.find({}).toArray();
    const allQuestionCount = allQuestions.length;
    const userQuestions = [];
    const existedIndexs = new Set();
    let count = 0;
    if (req.body.count > allQuestionCount) {
        res.send('Error: Wrong Question Count!');
    } else {
        while (count < req.body.count) {
            const index = getRandomInteger(0, allQuestionCount);
            if (!existedIndexs.has(index)) {
                userQuestions.push(allQuestions[index]);
                existedIndexs.add(index);
                count++;
            }
        }
        res.send(userQuestions);
    }
});

//Under construction: Not yet protected with authentication
router.post('/', async (req, res) => {
    const questionsCollection = await loadQuestionsCollection();
    const answersCollection = await loadAnswersCollection();
    const questionId = uuidv4();
    const newQuestion = req.body;
    newQuestion.uuid = questionId;
    const newAnswer = {
        uuid: questionId,
        answer: req.body.answer
    };
    delete newQuestion.answer;
    await questionsCollection.insertOne(newQuestion);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
});

module.exports = router;