const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

async function loadProblemsCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/server?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return client.db('server').collection('problems');
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
    const problemsCollection = await loadProblemsCollection();
    const allProblems = await problemsCollection.find({}).toArray();
    const allProblemsCount = allProblems.length;
    const userProblems = [];
    const existedIndexs = new Set();
    let count = 0;
    if (req.body.count > allProblemsCount) {
        res.send('Error: Wrong Problem Counts!');
    } else {
        while (count < req.body.count) {
            const index = getRandomInteger(0, allProblemsCount);
            if (!existedIndexs.has(index)) {
                userProblems.push(allProblems[index]);
                existedIndexs.add(index);
                count++;
            }
        }
        res.send(userProblems);
    }
});

//Under construction: Not yet protected with authentication
router.post('/', async (req, res) => {
    const problemsCollection = await loadProblemsCollection();
    const answersCollection = await loadAnswersCollection();
    const newProblem = req.body;
    delete newProblem.answer;
    const newAnswer = {
        problemId: req.body.problemId,
        answer: req.body.answer
    };
    await problemsCollection.insertOne(newProblem);
    await answersCollection.insertOne(newAnswer);
    res.send('Success!');
});

module.exports = router;