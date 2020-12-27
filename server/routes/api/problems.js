const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

async function loadProblemsCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/problems?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return client.db('problems').collection('inventory');
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
        res.send('Wrong Problem Numbers!');
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

module.exports = router;