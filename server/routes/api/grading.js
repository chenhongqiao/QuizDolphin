const express = require('express');
const { DateTime } = require('luxon');
const { promisify } = require('util');
const dbService = require('../../modules/dbService');
const redisService = require('../../modules/redisService');

const router = express.Router();

function QuizResultConstructor(score, questions, results, totalPoints) {
  this.score = score;
  this.totalPoints = totalPoints;
  this.timeStamp = DateTime.local().toUTC().toISO();
  this.questions = questions;
  this.questionsResult = results;
}

function QuestionResultConstructor(userAnswer, correctAnswer, score, uuid, points) {
  this.uuid = uuid;
  this.userAnswer = userAnswer;
  this.correctAnswer = correctAnswer;
  this.points = points;
  this.score = score;
}

function HistoryRecordConstructor(email, oldhistory, newrecord) {
  this.email = email;
  if (oldhistory) {
    this.history = oldhistory.history;
  } else {
    this.history = [];
  }
  this.history.push(newrecord);
}

function UserException(message) {
  this.message = message;
  this.type = 'UserException';
}

router.post('/', async (req, res, next) => {
  try {
    if (!req.session.loggedin) {
      res.send('Not Logged In!');
      return;
    }
    const { quizId } = req.body.data;
    if (!quizId) {
      throw new UserException('Invalid QuizID!');
    }
    const answersCollection = await dbService.loadCollection(`quiz${quizId}-answers`);
    const questionsCollection = await dbService.loadCollection(`quiz${quizId}-questions`);
    const onGoingCollection = await dbService.loadCollection(`quiz${quizId}-ongoing`);
    const questionsArray = (await onGoingCollection.findOne({ email: req.session.email })).question;
    const resultsArray = [];
    if (!req.body.data.answers || !Array.isArray(req.body.data.answers)) {
      throw new UserException('Invalid Answers Array!');
    }
    let totalPoints = 0;
    const score = req.body.data.answers.reduce(async (accumulator, current, index) => {
      const questionUuid = questionsArray[index].uuid;
      const correctAnswer = await answersCollection.findOne({ uuid: questionUuid });
      const question = await questionsCollection.findOne({ uuid: questionUuid });

      if (!correctAnswer || !question) {
        throw new UserException('Invalid UUID!');
      }

      // Grade single choice and short response questions
      if (question.type === 'single choice' || question.type === 'short response') {
        if (typeof current.answer !== 'string') {
          throw new UserException('Incorrect Answer Type!');
        }
        totalPoints += question.points;
        // Gain full points only if user's input match exactly with correct answer
        if (correctAnswer.answer === current.answer) {
          resultsArray.push(new QuestionResultConstructor(
            current.answer, correctAnswer.answer, question.points,
            questionUuid, question.points,
          ));
          return (await accumulator) + question.points;
        }
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswer.answer, 0, questionUuid, question.points,
        ));
        return accumulator;
      }

      // Grade multiple choice questions
      if (question.type === 'multiple choice') {
        const answersSet = new Set(correctAnswer.answer);
        if (!Array.isArray(current.answer)) {
          throw new UserException('Incorrect Answer Type!');
        }
        totalPoints += question.points;
        // Points are proportional to how many correction opions are chosen.
        // Additionally, user get 0 for the entire question if incorrect options are chosen.
        const correctCount = current.answer.reduce((countAccumulator, currentOption) => {
          if (answersSet.has(currentOption)) {
            return countAccumulator + 1;
          }
          return -Infinity;
        }, 0);
        if (correctCount < 0) {
          resultsArray.push(new QuestionResultConstructor(
            current.answer, correctAnswer.answer, 0, questionUuid, question.points,
          ));
          return accumulator;
        }
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswer.answer,
          question.points * (correctCount / answersSet.size),
          questionUuid, question.points,
        ));
        return (await accumulator) + question.points * (correctCount / answersSet.size);
      }

      if (question.type === 'matching') {
        if (!Array.isArray(current.answer)) {
          throw new UserException('Incorrect Answer Type!');
        }
        totalPoints += question.points;
        const correctMatch = current.answer.reduce((countAccumulator, currentRightCol, cindex) => {
          if (currentRightCol === correctAnswer.answer[cindex]) {
            return countAccumulator + 1;
          }
          return countAccumulator;
        }, 0);
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswer.answer,
          question.points * (correctMatch / correctAnswer.answer.length),
          questionUuid, question.points,
        ));
        return (await accumulator)
        + question.points * (correctMatch / correctAnswer.answer.length);
      }

      if (question.type === 'fill in the blanks') {
        if (!Array.isArray(current.answer)) {
          throw new UserException('Incorrect Answer Type!');
        }
        totalPoints += question.points;
        const correctMatch = current.answer.reduce((countAccumulator, currentRightCol, cindex) => {
          if (currentRightCol === correctAnswer.answer[cindex]) {
            return countAccumulator + 1;
          }
          return countAccumulator;
        }, 0);
        resultsArray.push(new QuestionResultConstructor(
          current.answer, correctAnswer.answer,
          question.points * (correctMatch / correctAnswer.answer.length),
          questionUuid, question.points,
        ));
        return (await accumulator)
        + question.points * (correctMatch / correctAnswer.answer.length);
      }

      return accumulator;
    }, Promise.resolve(0));

    const quizResult = new QuizResultConstructor(await score, questionsArray,
      resultsArray, totalPoints);
    const historyCollection = await dbService.loadCollection(`quiz${quizId}-history`);

    if (!req.session.email) {
      throw new Error('No User Email!');
    }

    const oldHistory = await historyCollection.findOne({ email: req.session.email });
    const newHistory = new HistoryRecordConstructor(req.session.email, oldHistory, quizResult);
    await historyCollection.replaceOne({ email: req.session.email }, newHistory, { upsert: true });
    await onGoingCollection.deleteOne({ email: req.session.email });
    const redis = redisService.loadDatabase(0);
    const redisDelete = promisify(redis.del).bind(redis);
    await redisDelete(req.session.email);
    res.send(quizResult);
  } catch (err) {
    if (err.type === 'UserException') {
      res.status(400).send(err.message);
      next(`${err.type}: ${err.message}`);
    } else {
      res.status(500).send('Internal Error!');
      next(err);
    }
  }
});

module.exports = router;
