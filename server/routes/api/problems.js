const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

async function loadProblemsCollection() {
    const client = await mongodb.MongoClient.connect('mongodb+srv://harry:3g2ZSNMaAGe7NDu6@fbla21-dev.lrnik.mongodb.net/problems?retryWrites=true&w=majority', {
        useNewUrlParser: true
    });
    return client.db('problems').collection('inventory');
}

function getRandomInteger(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

router.get('/random', async (req, res) => {
    console.log(req.query.number);
    const problemsCollection = await loadProblemsCollection();
    const allProblems = await problemsCollection.find({}).toArray();
    const allProblemsNumber = allProblems.length;
    const userProblems = [];
    const existedId = new Set();
    let number = 0;
    if (req.query.number > allProblemsNumber) {
        res.send('Wrong Problem Numbers');
    } else {
        while (number < req.query.number) {
            const index = getRandomInteger(0, allProblemsNumber);
            if (!existedId.has(index)) {
                userProblems.push(allProblems[index]);
                existedId.add(index);
                number++;
            }
        }
        res.send(userProblems);
    }
});

module.exports = router;